import httpx

from targets.base import BaseTarget


class WebLoginTarget(BaseTarget):
    """Sends the attacker's payload into the username field of a web login form."""

    def __init__(
        self,
        login_url: str,
        username_field: str = "username",
        password_field: str = "password",
        password_value: str = "password123",
    ):
        self._login_url = login_url
        self._username_field = username_field
        self._password_field = password_field
        self._password_value = password_value

    @property
    def name(self) -> str:
        return "web-login"

    @property
    def model(self) -> str:
        return self._login_url

    @property
    def kind(self) -> str:
        return "web"

    async def attack(self, payload: str) -> str:
        async with httpx.AsyncClient(timeout=20, follow_redirects=True) as client:
            response = await client.post(
                self._login_url,
                data={
                    self._username_field: payload,
                    self._password_field: self._password_value,
                },
            )
            return response.text
