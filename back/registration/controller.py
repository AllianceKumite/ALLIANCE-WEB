import json

import jwt
from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from rest_framework import exceptions
from rest_framework.authtoken.models import Token
from rest_framework.parsers import JSONParser
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .dynamic_models import CreateDynamicChamp
from .serializers import *
from django.db import connection
from django.core.mail import send_mail
from django.conf import settings
from .models import *
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from rest_framework.authtoken import views as auth_views
from rest_framework.compat import coreapi, coreschema
from rest_framework.schemas import ManualSchema
from rest_framework_jwt.settings import api_settings
from .helpers import *
from management.helpers import *
from apiPost.views import generateTranslations
from django.core.exceptions import ObjectDoesNotExist
from fight.helpers import *
import traceback as tb


def getParticipants(title, categoryId = None, coachId = None, clubId = None, regionId = None, countryId = None):
    cursor = connection.cursor()

    # categoryFilter = ' TRUE ' if (categoryId == None) or (int(categoryId) == 0) else f'{title}_champ.CategoryId   = {categoryId}'
    categoryFilter = ' TRUE ' if (categoryId == None) or (int(categoryId) == 0) else f'{title}_athchamp.CategoryId = {categoryId} OR {title}_athchamp.Category2Id   = {categoryId}'
    coachFilter    = ' TRUE ' if (coachId    == None) or (int(coachId   ) == 0) else f'{title}_coach.CoachId      = {coachId}'
    clubFilter     = ' TRUE ' if (clubId     == None) or (int(clubId    ) == 0) else f'{title}_club.ClubId        = {clubId}'
    regionFilter   = ' TRUE ' if (regionId   == None) or (int(regionId  ) == 0) else f'{title}_athchamp.regionId  = {regionId}'
    countryFilter  = ' TRUE ' if (countryId  == None) or (int(countryId ) == 0) else f'{title}_athchamp.countryId = {countryId}'

    categoryJoin = f' '
    # categoryJoin = f'LEFT JOIN {title}_champ ON (({title}_champ.AthIdRed = {title}_athchamp.athId ) OR ({title}_champ.AthIdWhite = {title}_athchamp.athId)) '
    coachJoin = f'LEFT JOIN {title}_coach ON {title}_coach.CoachId = {title}_athchamp.CoachId '
    clubJoin    = f'LEFT JOIN {title}_club  ON {title}_club.ClubId = {title}_athchamp.clubId '
    regionJoin = '' #f'JOIN regions ON regions.RegionId = {title}_athchamp.regionId '
    countryJoin = f'LEFT JOIN countries ON countries.countryId = {title}_athchamp.countryId '

    query = ('SELECT DISTINCT ' +
        # f'FIO, DAN, DateBR, Weight, Photo, {title}_club.ClubName, {title}_coach.coachName, ClubLogo, countryFlag  ' +
        f'FIO, DAN, DateBR, Weight, Photo, Kumite, Kata, KataGroup, {title}_athchamp.CountryId, {title}_athchamp.RegionId, {title}_athchamp.ClubId, {title}_athchamp.CoachId, {title}_club.ClubName, {title}_club.ClubCity, {title}_coach.coachName, countryFlag, {title}_club.ClubLogo, ' +
        # f'GROUP_CONCAT(DISTINCT {title}_champ.CategoryId) AS categoryId ' +

        f' (CASE WHEN ({title}_athchamp.CategoryId > 0 AND {title}_athchamp.Category2Id > 0 ) ' +
		f'THEN CONCAT({title}_athchamp.CategoryId, ",", {title}_athchamp.Category2Id ) ' +
		'ELSE ' +
				f'CASE WHEN ({title}_athchamp.CategoryId > 0) ' +
				f'THEN {title}_athchamp.CategoryId ' +
				f'ELSE {title}_athchamp.Category2Id END '+
		'END) ' +
        'AS categoryId ' +
        f'FROM {title}_athchamp ' +
        f'{coachJoin} ' +
        f'{clubJoin} ' +
        f'{categoryJoin} ' +
        f'{regionJoin} ' +
        f'{countryJoin} ' +
        f'WHERE {categoryFilter} AND {coachFilter} AND {clubFilter} AND {regionFilter} AND {countryFilter} '
        # +
    )

    cursor.execute(query)

    dict_to_return = dict_fetch_all(cursor)

    responseObject = {
        "filter": "",
        "participants": dict_to_return
    }

    return responseObject

def getReferys(title):
    cursor = connection.cursor()

    # categoryFilter = ' TRUE ' if (categoryId == None) or (int(categoryId) == 0) else f'{title}_champ.CategoryId   = {categoryId}'

    # clubJoin    = f'LEFT JOIN {title}_club  ON {title}_club.ClubId = {title}_refery.clubId '
    clubJoin    = f'LEFT JOIN clubs  ON clubs.ClubId = {title}_refery.clubId '
    countryJoin = f'LEFT JOIN countries ON countries.countryId = {title}_refery.countryId '

    query = ('SELECT DISTINCT ' +
        # f'FIO, DAN, Gender, {title}_club.ClubId, {title}_club.ClubName, countries.countryId, countryNameEn, countryNameRu, countryNameUa, countryFlag ' +
        f'FIO, DAN, Gender, ReferyId, TatamiId, BrigadeId, sushin, clubs.ClubId, clubs.ClubName, countries.countryId, countryNameEn, countryNameRu, countryNameUa, countryFlag ' +
        f'FROM {title}_refery ' +
        f'{clubJoin} ' +
        f'{countryJoin} ' +
        f'ORDER BY TatamiId, BrigadeId, sushin'
        # +
    )
    cursor.execute(query)

    dict_to_return = dict_refery_fetch_all(cursor)

    responseObject = {
        "filter": "",
        "referys": dict_to_return
    }

    return responseObject

def getReferysCoach(title, coachId = None):
    cursor = connection.cursor()

    # clubJoin    = f'LEFT JOIN {title}_club  ON {title}_club.ClubId = {title}_refery.clubId '
    clubJoin    = f'LEFT JOIN clubs  ON clubs.ClubId = {title}_refery.clubId '
    countryJoin = f'LEFT JOIN countries ON countries.countryId = {title}_refery.countryId '
    coachFilter = f'{title}_refery.CoachId = {coachId}'
    if (coachId == None) or (int(coachId) == 0):
        coachFilter = 'TRUE'

    query = ('SELECT ' +
        # f'FIO, DAN, Gender, {title}_club.ClubId, {title}_club.ClubName, countries.countryId, countryNameEn, countryNameRu, countryNameUa, countryFlag ' +
        f'FIO, DAN, Gender, ReferyId, clubs.ClubId, clubs.ClubName, countries.countryId, countryNameEn, countryNameRu, countryNameUa, countryFlag ' +
        f'FROM {title}_refery ' +
        f'{clubJoin} ' +
        f'{countryJoin} ' + 
        f'WHERE {coachFilter} ' +
        f'ORDER BY TatamiId, BrigadeId'
        # +
    )
    # print(query)
    cursor.execute(query)

    dict_to_return = dict_refery_fetch_all(cursor)

    responseObject = {
        "filter": "",
        "referys": dict_to_return
    }

    return responseObject

def getFightByCoach(title, coachId):
    cursor = connection.cursor()

    query = ('SELECT ' + 
            f'{title}_athchamp.FIO, {title}_champ.NumDuel, {title}_champ.TatamiId from {title}_athchamp inner join {title}_champ on '
            f'({title}_athchamp.athId = {title}_champ.AthIdRed or {title}_athchamp.athId = {title}_champ.AthIdWhite) and {title}_champ.NumDuel > 0 and {title}_champ.DuelIsPlace = 0 '
            f'where {title}_athchamp.CoachId = {coachId} order by {title}_champ.TatamiId, {title}_champ.NumDuel'
    )   
    print(query)
    cursor.execute(query)

    dict_to_return = dict_fetch_all(cursor)

    responseObject =  dict_to_return

    return responseObject

def getFightByClub(title, clubId):
    cursor = connection.cursor()

    query = ('SELECT ' + 
            f'{title}_athchamp.FIO, {title}_champ.NumDuel, {title}_champ.TatamiId from {title}_athchamp inner join {title}_champ on '
            f'({title}_athchamp.athId = {title}_champ.AthIdRed or {title}_athchamp.athId = {title}_champ.AthIdWhite) and {title}_champ.NumDuel > 0 and {title}_champ.DuelIsPlace = 0 '
            f'where {title}_athchamp.ClubId = {clubId} order by {title}_champ.TatamiId, {title}_champ.NumDuel'
    )   
    print(query)
    cursor.execute(query)

    dict_to_return = dict_fetch_all(cursor)

    responseObject =  dict_to_return

    return responseObject
