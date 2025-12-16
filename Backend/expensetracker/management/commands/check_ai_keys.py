import os
import re
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Check whether OPENAI_API_KEY and GEMINI_API_KEY are configured and look valid."

    def add_arguments(self, parser):
        parser.add_argument(
            "--show-full",
            action="store_true",
            help="Print full keys (not recommended).",
        )

    def handle(self, *args, **options):
        self.stdout.write("AI key check\n-----------")
        for name in ["OPENAI_API_KEY", "GEMINI_API_KEY"]:
            self._report_key(name, options.get("show_full", False))

    def _report_key(self, env_name: str, show_full: bool):
        raw = os.environ.get(env_name)
        if not raw:
            self.stdout.write(self.style.WARNING(f"{env_name}: not set"))
            return

        masked = raw if show_full else self._mask(raw)
        if self._looks_valid(env_name, raw):
            self.stdout.write(self.style.SUCCESS(f"{env_name}: present ({masked})"))
        else:
            self.stdout.write(self.style.ERROR(f"{env_name}: present but format looks unusual ({masked})"))

    def _mask(self, value: str) -> str:
        if len(value) <= 10:
            return "***"
        return f"{value[:6]}...{value[-4:]}"

    def _looks_valid(self, name: str, value: str) -> bool:
        if name == "OPENAI_API_KEY":
            return bool(re.match(r"^(sk-|sk-proj-)[A-Za-z0-9_-]+", value))
        if name == "GEMINI_API_KEY":
            return bool(re.match(r"^AIza[0-9A-Za-z_-]{30,}$", value))
        return False
