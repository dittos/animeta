from django.core.management.base import BaseCommand, CommandError
from search import indexer

class Command(BaseCommand):
    help = 'Build search index'

    def handle(self, *args, **options):
        indexer.run()
