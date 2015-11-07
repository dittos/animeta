from django.core.management.base import BaseCommand
from search import indexer


class Command(BaseCommand):
    help = 'Build search index'

    def handle(self, *args, **options):
        indexer.run()
