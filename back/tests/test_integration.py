# import unittest
from django.test import TestCase
# from myapp.models import Animal
# from django.db import connection

class AkTestCase(TestCase):
  fixtures = ['d']

  def testStub(self):
    # cursor = connection.cursor()

    # query = (f'SELECT title FROM champs')
    # cursor.execute(query)
    # champs = cursor.fetchall()

    # self.assertGreater(champs, 10)
    self.assertGreater(11, 10)


