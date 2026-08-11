import asyncio

from agents.attacker import generate_attack
from agents.judge import judge_agentic, judge_login, judge_response
from agents.mutator import mutate_prompt
from core.config import MUTATIONS_PER_FAIL, RATE_LIMIT_SLEEP
from core.db import log_attack, update_run_status
from targets.base import BaseTarget


async def run_attack_loop(
    run_id: str,
    target: BaseTarget,
    categories: list[str],
    topics: list[str],
    max_iterations: int = 100,
    on_result=None,
) -> None:
    """generate -> attack -> judge -> mutate -> log -> repeat."""
    try:
        budget_per_pair = max(1, max_iterations // max(1, len(topics) * len(categories)))

        for topic in topics:
            for category in categories:
                failures: list[dict] = []

                for iteration in range(budget_per_pair):
                    try:
                        if failures and iteration % MUTATIONS_PER_FAIL == 0:
                            last = failures[-1]
                            prompt = await mutate_prompt(
                                last["prompt"],
                                last["reason"],
                                category,
                                topic,
                                last.get("response"),
                            )
                        else:
                            feedback = [
                                f'Prompt: "{f["prompt"][:200]}" -> refused: {f["reason"][:200]}'
                                for f in failures
                            ]
                            prompt = await generate_attack(
                                category,
                                topic,
                                feedback,
                                iteration,
                            )

                        try:
                            response = await target.attack(prompt)
                        except Exception as exc:
                            response = ""
                            judgment = {
                                "success": False,
                                "confidence": 0.0,
                                "severity": "LOW",
                                "reason": f"Target error: {exc}",
                                "information_provided": None,
                            }

                        if response:
                            kind = getattr(target, "kind", "llm")
                            if kind == "web":
                                judgment = await judge_login(response)
                            elif kind == "agentic":
                                judgment = await judge_agentic(prompt, response, topic, category)
                            else:
                                judgment = await judge_response(prompt, response, topic, category)
                        else:
                            judgment = {
                                "success": False,
                                "confidence": 0.0,
                                "severity": "LOW",
                                "reason": judgment.get("reason", "Target returned empty response"),
                                "information_provided": None,
                            }

                        result = {
                            "run_id": run_id,
                            "category": category,
                            "topic": topic,
                            "prompt": prompt,
                            "response": response,
                            "success": bool(judgment.get("success")),
                            "severity": judgment.get("severity", "LOW"),
                            "confidence": float(judgment.get("confidence", 0.0)),
                            "reason": judgment.get("reason", ""),
                            "iteration": iteration,
                        }

                        await log_attack(result)
                        if on_result:
                            await on_result(result)

                        if result["success"]:
                            break
                        failures.append(
                            {
                                "prompt": prompt,
                                "reason": result["reason"],
                                "response": response,
                            }
                        )
                        await asyncio.sleep(RATE_LIMIT_SLEEP)

                    except Exception as exc:
                        await log_attack(
                            {
                                "run_id": run_id,
                                "category": category,
                                "topic": topic,
                                "prompt": "",
                                "response": "",
                                "success": False,
                                "severity": "LOW",
                                "confidence": 0.0,
                                "reason": f"Agent error: {exc}",
                                "iteration": iteration,
                            }
                        )
                        await asyncio.sleep(RATE_LIMIT_SLEEP)

        await update_run_status(run_id, "completed")
    except Exception:
        await update_run_status(run_id, "failed")
