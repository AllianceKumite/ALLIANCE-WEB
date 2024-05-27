from django.utils.translation import gettext_lazy as _
from .serializers import *
from django.db import connection
from .models import *
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
import jwt

def getChampType(champName):
    cursor = connection.cursor()
    cursor.execute("SELECT champType FROM champs WHERE title = '" + champName + "'")
    champType = cursor.fetchall()
    champType = champType[0] if len(champType) > 0 else []
    champType = champType[0] if len(champType) > 0 else None

    return champType


def getTatamisCount(champName):
    cursor = connection.cursor()
    query = (f'SELECT DISTINCT TatamiId FROM {champName}_champ')
    cursor.execute(query)
    result = cursor.fetchall()

    return len(result)

def getTimesByTatami(champName):
    cursor = connection.cursor()

    query = ( f"SELECT TatamiId, GROUP_CONCAT(DISTINCT {champName}_category.Time ORDER BY {champName}_category.Time ASC SEPARATOR ',' ) AS Times " +
              f"FROM {champName}_champ " +
              f"JOIN {champName}_category ON {champName}_champ.CategoryId = {champName}_category.categoryId " +
              "GROUP BY TatamiId")

    cursor.execute(query)

    result = tatami_one_fetch(cursor, None)

    return result

def getCategoryInfo(champName, categoryId):
    cursor = connection.cursor()

    query = (f'SELECT ' +
            f'DISTINCT CategoryType, TatamiId, LevelCircle, Time, idxAth1Place, idxAth2Place, idxAth3Place, idxAth4Place, Category3Place ' +
            f'FROM {champName}_category ' +
            f'JOIN {champName}_champ ON {champName}_champ.CategoryId = {champName}_category.categoryId ' +
            f'WHERE {champName}_category.CategoryId = {categoryId} ')

    cursor.execute(query)

    result = tatami_one_fetch(cursor, None)

    if len(result) > 0 :
        result = result[0]
    elif len(result) == 0:
        result = None

    return result


def getCoachInfo(champName, coachId):
    cursor = connection.cursor()

    query = (f'SELECT * ' +
            f'FROM {champName}_coach ' +
            f'WHERE {champName}_coach.CoachId = {coachId} ')

    cursor.execute(query)

    result = tatami_one_fetch(cursor, None)

    if len(result) > 0 :
        result = result[0]
    elif len(result) == 0:
        result = None

    return result


def getClubInfo(champName, clubId):
    cursor = connection.cursor()

    query = (f'SELECT * ' +
            f'FROM {champName}_club ' +
            f'WHERE {champName}_club.ClubId = {clubId} ')

    cursor.execute(query)

    result = tatami_one_fetch(cursor, None)

    if len(result) > 0 :
        result = result[0]
    elif len(result) == 0:
        result = None

    return result


# Unused
def getCountryInfo(champName, countryId, lng):
    cursor = connection.cursor()

    query = (f'SELECT countryName{lng} as countryName ' +
            f'FROM countries ' +
            f'WHERE countries.countryId = {countryId} ')

    cursor.execute(query)

    result = tatami_one_fetch(cursor, None)

    if len(result) > 0 :
        result = result[0]
    elif len(result) == 0:
        result = None

    return result


def getTatamisCategories(champName):
    cursor = connection.cursor()

    query = (f'SELECT {champName}_category.categoryId, TatamiId ' +
        f'FROM {champName}_champ ' +
        f'JOIN {champName}_category ' +
        f'ON {champName}_champ.CategoryId = {champName}_category.CategoryId ' +
        f'GROUP BY {champName}_category.categoryId, TatamiId ' +
        'ORDER BY TatamiId')

    cursor.execute(query)

    return fetch_tatami(cursor)

def getTatamisTotalDuel(champName, tatamiId):
    cursor = connection.cursor()
    query = f'SELECT COUNT(*) FROM {champName}_champ WHERE ({champName}_champ.TatamiId = {tatamiId} and {champName}_champ.NumDuel > 0)'
    cursor.execute(query)
    count = int(cursor.fetchall()[0][0])
    return count

def getTatamisUpToSemiDuel(champName, tatamiId):
    cursor = connection.cursor()
    query = f'SELECT COUNT(*) FROM {champName}_champ JOIN {champName}_category ON {champName}_champ.CategoryId = {champName}_category.CategoryId WHERE (({champName}_champ.TatamiId = {tatamiId} and {champName}_category.CategoryType = 1 and {champName}_champ.NumDuel > 0 and Level in (0,1,2)) or ({champName}_champ.TatamiId = {tatamiId} and {champName}_category.CategoryType = 0 and {champName}_champ.NumDuel > 0 and Level <=6))'
    cursor.execute(query)
    count = int(cursor.fetchall()[0][0])
    return count

def getTatamisSemiFinalFinalDuel(champName, tatamiId):
    cursor = connection.cursor()
    query = f'SELECT COUNT(*) FROM {champName}_champ WHERE ({champName}_champ.TatamiId = {tatamiId} and {champName}_champ.NumDuel > 0 and Level >6)'
    query = f'SELECT COUNT(*) FROM {champName}_champ JOIN {champName}_category ON {champName}_champ.CategoryId = {champName}_category.CategoryId WHERE (({champName}_champ.TatamiId = {tatamiId} and {champName}_category.CategoryType = 1 and {champName}_champ.NumDuel > 0 and Level in (3,4)) or ({champName}_champ.TatamiId = {tatamiId} and {champName}_category.CategoryType = 0 and {champName}_champ.NumDuel > 0 and Level > 6))'
    cursor.execute(query)
    count = int(cursor.fetchall()[0][0])
    return count

def filterCategories(champName, tatami, time):
    cursor = connection.cursor()

    if time != None and tatami == None:
      filterClause = f'WHERE Time = {time} '
    elif time == None and tatami != None:
      filterClause = f'WHERE TatamiId = {tatami} '
    elif time != None and tatami != None:
      filterClause = f'WHERE Time = {time} and TatamiId = {tatami} '
    else:
      filterClause = ''

    query = (f'SELECT {champName}_category.categoryId ' +
        f'FROM {champName}_champ ' +
        f'JOIN {champName}_category ' +
        f'ON {champName}_champ.CategoryId = {champName}_category.CategoryId ' +
        filterClause +
        f'GROUP BY {champName}_category.categoryId, TatamiId ' +
        'ORDER BY categoryId ')

    # print('==================================')
    # print(query)
    # print('==================================')

    cursor.execute(query)

    return fetch_categories_solo(cursor)



def getWinnersClubs(entity, champName, winnersPlace, champType, onlyIfNoFightForUpperPlace = False):
    return getWinnersEntities('club', champName, winnersPlace, champType, onlyIfNoFightForUpperPlace)


def getClubPlacesAndAggregate(aggregated, champName, winnersPlace, champType, onlyIfNoFightForUpperPlace, pointsForPlace):
    return getEntityPlacesAndAggregate('club', aggregated, champName, winnersPlace, champType, onlyIfNoFightForUpperPlace, pointsForPlace)


def aggregateClubPlacesTo(aggregated, places, placeNumber = 0, pointsForPlace = 0):
    return aggregateEntityPlacesTo('club', aggregated, places, placeNumber, pointsForPlace)



def getEntityResults(entity, champName, champType, checkTeamCompetition = False):
    POINTS_1_PLACE = 15
    POINTS_2_PLACE = 8
    POINTS_3_PLACE = 5
    POINTS_4_PLACE = 5

    # retrieveAllEntities = entity == 'coach' or entity == 'club'
    retrieveAllEntities = True

    results = {}

    results = getEntityPlacesAndAggregate(entity, results, champName, 1, champType, False, POINTS_1_PLACE, not retrieveAllEntities, checkTeamCompetition)
    results = getEntityPlacesAndAggregate(entity, results, champName, 2, champType, False, POINTS_2_PLACE, not retrieveAllEntities, checkTeamCompetition)
    results = getEntityPlacesAndAggregate(entity, results, champName, 3, champType, False, POINTS_3_PLACE, not retrieveAllEntities, checkTeamCompetition)
    results = getEntityPlacesAndAggregate(entity, results, champName, 4, champType, True, POINTS_4_PLACE, not retrieveAllEntities, checkTeamCompetition)

    # print("==================================++++++++++++")
    if retrieveAllEntities :
        allEntities = getAllEntities(entity, champName, champType)

        results = aggregateEntityPlacesTo(entity, results, allEntities)

        if entity == "organization" :
            entity = "org"

        for entityItem in allEntities:
            # print(entityItem)
            results[entityItem[f"{entity}Id"]]["name"] = entityItem[f"{entity}Name"]

            if f"{entity.capitalize()}Logo" in entityItem :
                results[entityItem[f"{entity}Id"]]["logo"] = entityItem[f"{entity.capitalize()}Logo"]

    return results


def getEntityClubCountResults(entity, champName, champType, checkTeamCompetition = False):
    POINTS_1_PLACE = 1
    POINTS_2_PLACE = 1
    POINTS_3_PLACE = 1
    POINTS_4_PLACE = 1

    # retrieveAllEntities = entity == 'coach' or entity == 'club'
    retrieveAllEntities = True

    results = {}

    results = getEntityPlacesAndAggregate(entity, results, champName, 1, champType, False, POINTS_1_PLACE, not retrieveAllEntities, checkTeamCompetition)
    results = getEntityPlacesAndAggregate(entity, results, champName, 2, champType, False, POINTS_2_PLACE, not retrieveAllEntities, checkTeamCompetition)
    results = getEntityPlacesAndAggregate(entity, results, champName, 3, champType, False, POINTS_3_PLACE, not retrieveAllEntities, checkTeamCompetition)
    results = getEntityPlacesAndAggregate(entity, results, champName, 4, champType, True, POINTS_4_PLACE, not retrieveAllEntities, checkTeamCompetition)
    # results = getEntityPlacesAndAggregate(entity, results, champName, 1, champType, False, POINTS_1_PLACE, not retrieveAllEntities, checkTeamCompetition)
    # results = getEntityPlacesAndAggregate(entity, results, champName, 2, champType, False, POINTS_2_PLACE, not retrieveAllEntities, checkTeamCompetition)
    # results = getEntityPlacesAndAggregate(entity, results, champName, 3, champType, False, POINTS_3_PLACE, not retrieveAllEntities, checkTeamCompetition)
    # results = getEntityPlacesAndAggregate(entity, results, champName, 4, champType, True, POINTS_4_PLACE, not retrieveAllEntities, checkTeamCompetition)

    # print("==================================++++++++++++")
    if retrieveAllEntities :
        allEntities = getAllEntities(entity, champName, champType)

        results = aggregateEntityPlacesTo(entity, results, allEntities)

        if entity == "organization" :
            entity = "org"

        for entityItem in allEntities:
            # print(entityItem)
            results[entityItem[f"{entity}Id"]]["name"] = entityItem[f"{entity}Name"]

            if f"{entity.capitalize()}Logo" in entityItem :
                results[entityItem[f"{entity}Id"]]["logo"] = entityItem[f"{entity.capitalize()}Logo"]

    return results

def getEntityCoachCountResults(entity, champName, champType, checkTeamCompetition = False):
    POINTS_1_PLACE = 1
    POINTS_2_PLACE = 1
    POINTS_3_PLACE = 1
    POINTS_4_PLACE = 1

    # retrieveAllEntities = entity == 'coach' or entity == 'club'
    retrieveAllEntities = True

    results = {}

    results = getEntityPlacesAndAggregate(entity, results, champName, 1, champType, False, POINTS_1_PLACE, not retrieveAllEntities, checkTeamCompetition)
    results = getEntityPlacesAndAggregate(entity, results, champName, 2, champType, False, POINTS_2_PLACE, not retrieveAllEntities, checkTeamCompetition)
    results = getEntityPlacesAndAggregate(entity, results, champName, 3, champType, False, POINTS_3_PLACE, not retrieveAllEntities, checkTeamCompetition)
    results = getEntityPlacesAndAggregate(entity, results, champName, 4, champType, True, POINTS_4_PLACE, not retrieveAllEntities, checkTeamCompetition)
    # results = getEntityPlacesAndAggregate(entity, results, champName, 1, champType, False, POINTS_1_PLACE, not retrieveAllEntities, checkTeamCompetition)
    # results = getEntityPlacesAndAggregate(entity, results, champName, 2, champType, False, POINTS_2_PLACE, not retrieveAllEntities, checkTeamCompetition)
    # results = getEntityPlacesAndAggregate(entity, results, champName, 3, champType, False, POINTS_3_PLACE, not retrieveAllEntities, checkTeamCompetition)
    # results = getEntityPlacesAndAggregate(entity, results, champName, 4, champType, True, POINTS_4_PLACE, not retrieveAllEntities, checkTeamCompetition)

    # print("==================================++++++++++++")
    if retrieveAllEntities :
        allEntities = getAllEntities(entity, champName, champType)

        results = aggregateEntityPlacesTo(entity, results, allEntities)

        if entity == "organization" :
            entity = "org"

        for entityItem in allEntities:
            # print(entityItem)
            results[entityItem[f"{entity}Id"]]["name"] = entityItem[f"{entity}Name"]

            if f"{entity.capitalize()}Logo" in entityItem :
                results[entityItem[f"{entity}Id"]]["logo"] = entityItem[f"{entity.capitalize()}Logo"]

    return results

def getEntityClubWomenResults(entity, champName, champType, checkTeamCompetition = False):
    POINTS_1_PLACE = 15
    POINTS_2_PLACE = 8
    POINTS_3_PLACE = 5
    POINTS_4_PLACE = 5

    # retrieveAllEntities = entity == 'coach' or entity == 'club'
    retrieveAllEntities = True

    results = {}

    results = getEntityPlacesAndAggregate(entity, results, champName, 1, champType, False, POINTS_1_PLACE, not retrieveAllEntities, False, True)
    results = getEntityPlacesAndAggregate(entity, results, champName, 2, champType, False, POINTS_2_PLACE, not retrieveAllEntities, False, True)
    results = getEntityPlacesAndAggregate(entity, results, champName, 3, champType, False, POINTS_3_PLACE, not retrieveAllEntities, False, True)
    results = getEntityPlacesAndAggregate(entity, results, champName, 4, champType, True, POINTS_4_PLACE, not retrieveAllEntities, False, True)

    # print("==================================++++++++++++")
    if retrieveAllEntities :
        allEntities = getAllEntities(entity, champName, champType)

        results = aggregateEntityPlacesTo(entity, results, allEntities)

        if entity == "organization" :
            entity = "org"

        for entityItem in allEntities:
            # print(entityItem)
            results[entityItem[f"{entity}Id"]]["name"] = entityItem[f"{entity}Name"]

            if f"{entity.capitalize()}Logo" in entityItem :
                results[entityItem[f"{entity}Id"]]["logo"] = entityItem[f"{entity.capitalize()}Logo"]

    return results

def getAllEntities(entity, champName, champType):
    cursor = connection.cursor()

    query = (f'SELECT {champName}_{entity}.{entity}Id, {champName}_{entity}.{entity}Name, {champName}_{entity}.* ' +
                f'FROM {champName}_{entity} ')

    if entity == "region" :
        query = (f'SELECT DISTINCT regions.regionId, regions.regionId as regionName, regions.regionFlag as RegionLogo ' +
                f'FROM regions ' +
                f'JOIN {champName}_athchamp ' +
                f'ON {champName}_athchamp.regionId = regions.regionId '
        )

    elif entity == "organization" :
        query = (f'SELECT DISTINCT organization.orgId, organization.orgName, organization.orgFlag as OrgLogo ' +
                f'FROM organization ' +
                f'JOIN {champName}_club ' +
                f'ON {champName}_club.orgId = organization.orgId '
                f'JOIN {champName}_athchamp ' +
                f'ON {champName}_athchamp.clubId = {champName}_club.clubId '
        )

    elif entity == "country" :
        query = (f'SELECT countries.countryId, countries.countryId as countryName, countries.countryFlag as CountryLogo ' +
                f'FROM countries ' +
                f'JOIN {champName}_athchamp ' +
                f'ON {champName}_athchamp.countryId = countries.countryId '
        )

    cursor.execute(query)

    allEntities = tatami_one_fetch(cursor, champType, entity)

    return allEntities


# @csrf_exempt
# # def getAllClubs(champName, champType):
# #     return getAllEntities('club', champName, champType)



def getEntityPlacesAndAggregate(entity, aggregated, champName, winnersPlace, champType, onlyIfNoFightForUpperPlace, pointsForPlace, verboseMode = False, checkTeamCompetition = False, womenOnly = False):
    places = getWinnersEntities(entity, champName, winnersPlace, champType, onlyIfNoFightForUpperPlace, verboseMode, checkTeamCompetition,  womenOnly)

    if onlyIfNoFightForUpperPlace:
        winnersPlace = winnersPlace - 1

    aggregated = aggregateEntityPlacesTo(entity, aggregated, places, winnersPlace, pointsForPlace, verboseMode)

    return aggregated



def getWinnersEntities(entity, champName, winnersPlace, champType, onlyIfNoFightForUpperPlace = False, verboseMode = False, checkTeamCompetition = False, womenOnly = False):
    cursor = connection.cursor()
    # print(entity)
    if (entity == 'country'):
        entityTable = 'countries'
    elif (entity == 'region'):
        entityTable = 'regions'
    elif (entity == 'organization'):
        entityTable = 'organization'
        entity = 'org'
    else:
        entityTable = f'{champName}_{entity}'

    # entity is club / coach
    query = (f'SELECT {entityTable}.{entity}Id, count(*) AS victories ')

    if verboseMode == True :
        if (entity != 'org'):
            query = ( query +
                f', {entity}NameUa AS name, {entity}Flag AS logo ')
        else :
            query = ( query +
                f', {entity}Name AS name, {entity}Flag AS logo ')

    query = ( query +
                f'FROM {entityTable} ')


    if (entity == 'org'):
        # Join via club
        query = ( query +
                f'JOIN {champName}_club ' +
                f'ON {entityTable}.{entity}Id = {champName}_club.{entity}Id ' +
                f'JOIN {champName}_athchamp ' +
                f'ON {champName}_club.ClubId = {champName}_athchamp.clubId ')
    else:
        query = ( query +
                f'JOIN {champName}_athchamp ' +
                f'ON {entityTable}.{entity}Id = {champName}_athchamp.{entity}Id ')

    if checkTeamCompetition:
        query = ( query +
                f'JOIN {champName}_category ' +
                f'ON {champName}_category.idxAth{winnersPlace}Place = {champName}_athchamp.athId and {champName}_athchamp.teamcompetition = 1 ')
    else:
        if womenOnly:
            query = ( query +
                    f'JOIN {champName}_category ' +
                    f'ON {champName}_category.idxAth{winnersPlace}Place = {champName}_athchamp.athId and {champName}_athchamp.Gender = "Ж(F)" ')
        else:
            query = ( query +
                    f'JOIN {champName}_category ' +
                    f'ON {champName}_category.idxAth{winnersPlace}Place = {champName}_athchamp.athId ')

    if onlyIfNoFightForUpperPlace:
        upperPlace = winnersPlace - 1
        query = (query +
                f'AND {champName}_category.Category{upperPlace}Place = "0" ')
    query = ( query +
                f'GROUP BY {entityTable}.{entity}Id ' )

    if verboseMode :
        query = ( query +
            f', name, logo ' )

    query = ( query +
                f'ORDER BY {entity}Id')

    # print("================================================")
    # print(query)
    # print("================================================")

    cursor.execute(query)

    return tatami_one_fetch(cursor, champType)


def aggregateEntityPlacesTo(entity, aggregated, places, placeNumber = 0, pointsForPlace = 0, verboseMode = False):
    if entity == 'organization' :
        entity = 'org'

    for entityItem in places:
        # print('=====================================================')
        # print(entityItem)
        if not entityItem[f"{entity}Id"] in aggregated:
            aggregated[entityItem[f"{entity}Id"]] = {
                "medals": { "1" : 0, "2" : 0, "3" : 0 },
                "points": 0
            }

        if 'victories' in entityItem:
            aggregated[entityItem[f"{entity}Id"]]["medals"][str(placeNumber)] = aggregated[entityItem[f"{entity}Id"]]["medals"][str(placeNumber)] + int(entityItem["victories"])
            aggregated[entityItem[f"{entity}Id"]]["points"] = aggregated[entityItem[f"{entity}Id"]]["points"] + int(entityItem["victories"]) * pointsForPlace

        if verboseMode :
            aggregated[entityItem[f"{entity}Id"]]['name'] = entityItem["name"]

            if 'logo' in entityItem :
                aggregated[entityItem[f"{entity}Id"]]['logo'] = entityItem["logo"]

    return aggregated


def isSuperAdmin(full_token):
    isSuperAdmin = False

    if full_token is not None or full_token != '':
        token = full_token.split(' ')[1]

        user = None

        if ((token != '')) :
            try:
                decode = Token.objects.get(key=token)

                user = User.objects.get(username=decode.user.username)

            except:
                try:
                    decode = jwt.decode(token, verify=False)

                    user = User.objects.get(id=decode['user_id'])
                except:
                    pass

            isSuperAdmin = user != None and user.username == settings.APP_SUPERADMIN

    return isSuperAdmin


def getCurrentUser(full_token):
    currentUser = None

    if full_token is not None or full_token != '':
      token = full_token.split(' ')[1]

      if token != '':
          userId = None

          try:
            decode = Token.objects.get(key=token)
            userId = decode.user.id
          except:
              pass

          if userId != None:
              user = User.objects.get(id=userId)

              ## username = user.username.split(' ')[0]
              # coach = Coaches.objects.get(userId=user)
              coach = Coaches.objects.select_related().filter(user = userId).values()[0]
              username = coach["coachName"]
              coachBranch = coach["branchId_id"]
              branchObj = Branch.objects.filter(pk=coachBranch).first()
              branch = branchObj.branchName if branchObj is not None else None
              isBranch = branch.split(' ')[0] in username.split(' ')[0] if coachBranch is not None else False

              clubObj = Clubs.objects.select_related().filter(clubId = coach["clubId_id"]).values()
              clubName = clubObj[0]['clubName'] if len(clubObj) > 0 else None

              query = f"SELECT role, details FROM coach_role WHERE coach_id = {coach['coachId']}"
              cursor = connection.cursor()
              cursor.execute(query)

              roleAndDetails = tatami_one_fetch(cursor)

              currentUser = {
                  'coachId': coach['coachId'],
                  'club': clubName,
                  'coach': username,
                  'branch': branch,
                  'isBranch': isBranch,
                  'isBlocked' : coach['blocked'],
                  'isSuperAdmin': True if username == settings.APP_SUPERADMIN else False,
                  'role' : roleAndDetails
              }

    return currentUser


