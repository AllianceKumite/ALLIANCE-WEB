from registration.serializers import *
from registration.helpers import *
from django.db import connection


# For draws
def getCategoryFightsWithParticipants(champName, champType, category, categoryType):
    categoryFights = filterFights(champName, champType = champType, category = category, futureFightsOnly = False, skipNumDuelOForWkbDraw = True, orderForDraw = True, takeTimeIntoAccount = False)

    categoryFightsWithParticipants = fetchParticipantsForFights(categoryFights, champName, champType, categoryType)

    return categoryFightsWithParticipants

#For online tatami
def getCurrentAndAllNextFightsWithParticipants(champName, champType, tatami, amountToFetch):
    fights = filterFights(champName, champType = champType, tatami = tatami, amountToFetch = amountToFetch)

    fightsWithParticipants = fetchParticipantsForFights(fights, champName, champType, None)

    return fightsWithParticipants

def getFightsToManageWithParticipants(champName, tatami = None, category = None, time = None, amount = None, champType = None):
    champType = getChampType(champName) if champType == None else champType
    fights = filterFights(champName, champType = champType, tatami = tatami, category = category, time = time, amountToFetch = amount,  futureFightsOnly = False)

    fightsWithParticipants = fetchParticipantsForFights(fights, champName, champType, None)

    return fightsWithParticipants


# @Returns either object or None
def getCurrentFight(champName, champType, tatami, category, time):
    return filterFights(champName, champType = champType, tatami = tatami, category = category, time = time, amountToFetch = 1, withDurations = True)

def getTatamiFightsCount(champName, champType, tatami):
    return filterFights(champName, champType = champType, tatami = tatami, countOnly = True)

# Compatibility functoin

def getTatamiTime(champName):
  MINIMUM_TATAMI_TIME_CHAMP_ID = 92
  cursor = connection.cursor()
  query = f"SELECT champId FROM champs WHERE title = '{champName}'"
  cursor.execute(query)
  fetched = cursor.fetchall()

  index = int(fetched[0][0]) if len(fetched) > 0 else 0

  isTatamiTime =  index >= MINIMUM_TATAMI_TIME_CHAMP_ID

  return isTatamiTime


def defineCategory(champName, categoryId):
    cursor = connection.cursor()
    query = (f'SELECT LevelCircle ' +
            f'FROM {champName}_category ' +
            f'WHERE {champName}_category.categoryId = {str(categoryId)}'
    )
    # print(query)
    cursor.execute(query)
    result = cursor.fetchall()[0][0]
    # print(result)
    return result
    # private
             

# if tatamiNumber = 0 then fetches all tatamis
def filterFights(champName, champType = None, tatami = None, category = None, time = None, level = None, amountToFetch = None, withDurations = False, futureFightsOnly = True, skipNumDuelOForWkbDraw = False, skipWkbDesqualified = False, orderForDraw = False, countOnly = False, takeTimeIntoAccount = True, log = False):
    # log = True
    cursor = connection.cursor()
    minBal = 0
    if champType == None:
        champType = getChampType(champName)

    isTatamiTime = getTatamiTime(champName)

    durationsQuery = ',TimeDuel1, TimeDuel2, TimeDuel3, TimeDuel4, TimeDuel5, TimeFDuel1, TimeFDuel2, TimeFDuel3, TimeFDuel4, TimeFDuel5 ' if withDurations == True else ' '

    columns = ' Count(NumDuel) ' if countOnly else f' {champName}_champ.*, CategoryType, CategoryBlockCount, TimeFDuel1, TimeFDuel2, TimeFDuel3, TimeFDuel4, TimeFDuel5, {champName}_category.KataGroup, {champName}_category.LevelCircle, {champName}_champ.TatamiId, {champName}_champ.LevePair {durationsQuery} '

    tatamiFilter = f'{champName}_champ.TatamiId = {str(tatami)} ' if (tatami != None and int(tatami) > 0)  else ' True '
    categoryFilter = f'{champName}_champ.categoryId = {str(category)} ' if category != None else ' True '
    levelFilter = f'{champName}_champ.Level = {str(level)} ' if level != None else ' True '

    if (isTatamiTime) :
        joinChamps = ' '
        joinTatami = f'LEFT JOIN {champName}_tatami ON {champName}_champ.TatamiId = {champName}_tatami.id '

        if takeTimeIntoAccount:
            timeFilter  = f' {champName}_category.Time = {str(time)} ' if (time != None and int(time) > 0) else f'{champName}_category.Time = {champName}_tatami.actualTime '
        else:
            timeFilter = ' True '
    else :
        # To render draws from old tournaments
        if takeTimeIntoAccount:
          joinChamps = (f' JOIN champs ON champs.title = "{champName}" AND ' +
              (f'{champName}_category.Time = {str(time)} ' if (time != None and int(time) > 0) else f'{champName}_category.Time = champs.actualTime ')
            )

        else:
          joinChamps = ' '

        joinTatami = ' '

        timeFilter =  ' True '

    isJoinAthchamp = (not orderForDraw ) and (skipWkbDesqualified) and (level > 6)

    joinAthchamp = ''

    if (isJoinAthchamp):
        joinAthchamp = f' JOIN {champName}_athchamp ON {champName}_champ.AthIdRed = {champName}_athchamp.athId '

    if futureFightsOnly:
        futureFightsFilter =  f' DuelIsPlace = 0 AND NumDuel > 0 '
    elif orderForDraw:
        futureFightsFilter =  ' True '
    else :
        futureFightsFilter =  ' NumDuel > 0 '


    amountFilter = f' LIMIT {amountToFetch} ' if amountToFetch != None else ''

    order = ' NumDuel asc '

    if orderForDraw :
        order = ' LevePair asc, NumPair asc '
    elif skipWkbDesqualified :
        order = ' Avg asc ' if level == 6 else ' CountBallKata desc '


    wkbSpecialFilter = ' True '
    if skipNumDuelOForWkbDraw :
        wkbSpecialFilter = (
            f'({champName}_category.CategoryType != 3 ' +
            f'OR ' +
            f'({champName}_category.CategoryType = 3 ' +
                f'AND {champName}_champ.NumDuel != 0)' +
            ')'
        )

    desqualifiedFilter = ' True '
    if skipWkbDesqualified :
      desqualifiedFilter = (
        f'({champName}_category.CategoryType != 3 ' +
        f'OR ' +
        f'({champName}_category.CategoryType = 3 ' +
            f'AND {champName}_champ.Avg >= 1) ' +
        ')'
    )

    query = (f'SELECT {columns} ' +
            f'FROM {champName}_champ ' +
            f'JOIN {champName}_category ON {champName}_champ.categoryId = {champName}_category.categoryId ' +
           f'{joinTatami}' +
            f'{joinChamps}' +
            f'{joinAthchamp}' +
            f'WHERE {tatamiFilter} AND {categoryFilter} AND {timeFilter} AND {levelFilter} AND {futureFightsFilter} AND {wkbSpecialFilter} AND {desqualifiedFilter} ' +
            f'ORDER BY {order} ' +
            amountFilter
    )

    # if log:
    # print(query)

    cursor.execute(query)

    if (countOnly) :
        result = cursor.fetchall()[0][0]
    else :
        result = tatami_one_fetch(cursor, champType)

        if log:
          print(result)

        # For now works only for amount filter 1
        if withDurations :
            result = result[0] if len(result) > 0 else None

            if (result) :
              if int(result['Level'])  > 6 :
                  result['duration'] = result['TimeFDuel1'] + ',' + result['TimeFDuel2'] + ',' + result['TimeFDuel3'] + ',' + result['TimeFDuel4']
              elif (int(result['Level']) >= 0 and int(result['Level']) <= 6 ):
                  result['duration'] = result['TimeDuel1'] + ',' + result['TimeDuel2'] + ',' + result['TimeDuel3'] + ',' + result['TimeDuel4']

              # Remove unnecessary fields
              del result['TimeDuel1']
              del result['TimeDuel2']
              del result['TimeDuel3']
              del result['TimeDuel4']
              del result['TimeFDuel1']
              del result['TimeFDuel2']
              del result['TimeFDuel3']
              del result['TimeFDuel4']

    if log:
      print(result)

    return result


def getCurrentFightForTatamisTimeAndCategory(title, tatami = None, time = None, category = None):
    champType = getChampType(title)

    if (tatami is None) :
      tatamisCount = getTatamisCount(title)
    else:
      tatamisCount = 1

    tatamisCurrentFights = {}

    # for tatamiId in tatamisCategories:
    for tatamiId in range(1, tatamisCount + 1):
      currentFight = None

      if (tatami != None):
          tatamiId = tatami

      currentFightDetils = getCurrentFight(title, champType, tatamiId, category, time)
    #   print(currentFightDetils)
      if currentFightDetils != None:
          currentFightDetils['tatamiId'] = tatamiId

          # we dont need total info if tatami is specified
          if (tatami == None):
              currentFightDetils['total'] = getTatamiFightsCount(title, champType, tatamiId)

          currentFight = {
              'details': currentFightDetils,
              'red': getParticipantInfo(title, champType, currentFightDetils['AthIdRed']),
              'white': getParticipantInfo(title, champType, currentFightDetils['AthIdWhite'])
          }
        #   print(currentFightDetils)

          if (tatami == None):
              tatamisCurrentFights[tatamiId] = currentFight
          else :
              tatamisCurrentFights = currentFight

    return tatamisCurrentFights

def getPreviousFightParticipant(fightDetails, champName, akaShiro):
    cursor = connection.cursor()

    numDuel = fightDetails['NumDuel']
    categoryId = fightDetails['CategoryId']

    sorting = "ASC" if akaShiro == "red" else "DESC"
    query = (f"SELECT NumDuel FROM {champName}_champ " +
          f"WHERE NextDuel = {numDuel} AND CategoryId = {categoryId} AND NumDuel != 0 " +
          f"ORDER BY NumDuel {sorting} Limit 1")

    cursor.execute(query)
    fetched = cursor.fetchall()
    fetched = fetched[0][0] if len(fetched) > 0 else None

    if (fetched is None and fightDetails['Level'] == '8'):
        query = (f"SELECT NumDuel FROM {champName}_champ " +
            f"WHERE Level = 7 AND CategoryId = {categoryId} " +
            f"ORDER BY NumDuel {sorting} Limit 1")

        cursor.execute(query)
        fetched = cursor.fetchall()
        fetched = (-fetched[0][0]) if len(fetched) > 0 else 0

    if (fetched is None):
        fetched = 0

    return fetched


def fetchParticipantsForFights(fightsDetails, champName, champType, categoryType):
    fightsWithParticipants = []

    if fightsDetails:
        for fightDetails in fightsDetails:
            isRed = int(fightDetails['AthIdRed']) != -1
            isWhite = int(fightDetails['AthIdWhite']) != -1

            # if (isRed) :
            #     redParticipant = getParticipantInfo(champName, champType, fightDetails['AthIdRed'])
            # else :
            #     upDuelRed = int (getPreviousFightParticipant(fightDetails, champName, "red"))
            #     categoryType = fightDetails['CategoryType'] if categoryType == None else categoryType
            #     isQualification = upDuelRed == -1 and (categoryType == '3' or categoryType == '2')
            #     redParticipant = { 'FIO': (str(upDuelRed) if not isQualification else '')}

            # if (isWhite) :
            #     whiteParticipant = getParticipantInfo(champName, champType, fightDetails['AthIdWhite'])
            # else :
            #     upDuelWhite = int (getPreviousFightParticipant(fightDetails, champName, "white"))
            #     categoryType = fightDetails['CategoryType'] if categoryType == None else categoryType
            #     isQualification = upDuelWhite == -1 and (categoryType == '3' or categoryType == '2')
            #     whiteParticipant = { 'FIO': (str(upDuelWhite) if not isQualification else '')}

            if (isRed) :
                redParticipant = getParticipantInfo(champName, champType, fightDetails['AthIdRed'])
            else :
                upDuelRed = int (getPreviousFightParticipant(fightDetails, champName, "red"))
                categoryType = fightDetails['CategoryType'] if categoryType == None else categoryType
                isQualification = upDuelRed == -1 and (categoryType == '3')
                redParticipant = { 'FIO': (str(upDuelRed) if not isQualification else '')}

            if (isWhite) :
                whiteParticipant = getParticipantInfo(champName, champType, fightDetails['AthIdWhite'])
            else :
                upDuelWhite = int (getPreviousFightParticipant(fightDetails, champName, "white"))
                categoryType = fightDetails['CategoryType'] if categoryType == None else categoryType
                isQualification = upDuelWhite == -1 and (categoryType == '3')
                whiteParticipant = { 'FIO': (str(upDuelWhite) if not isQualification else '')}

            fight = {
                'red' : redParticipant,
                'white': whiteParticipant,
                'details': fightDetails
            }

            fightsWithParticipants.append(fight)

    return fightsWithParticipants


def getParticipantInfo(champName, champType, participantId):
    cursor = connection.cursor()

    query = ('SELECT FIO, OrdNum, Photo, CountBall, CountBallKata, CountWinner, Weight, ClubLogo, ' + champName + '_club.clubName, ' + champName + '_coach.coachName, regionFlag, countryFlag, countryKod, athId, regions.regionId, countries.countryId, DateBR, DAN, lvl1, lvl2, lvl3, lvl4, lvl5, lvl6, lvl7, lvl8, lvl12 ' +
            'FROM ' + champName + '_athchamp ' +
            'JOIN ' + champName + '_club ' +
            'ON ' + champName + '_athchamp.clubId = ' + champName + '_club.clubId ' +
            'JOIN ' + champName + '_coach ' +
            'ON ' + champName + '_athchamp.CoachId = ' + champName + '_coach.CoachId ' +
            'LEFT JOIN regions ' +
            'ON regions.regionId = ' + champName + '_athchamp.regionId ' +
            'JOIN countries ' +
            'ON countries.countryId = ' + champName + '_athchamp.CountryId ' +
            'WHERE athId = ' + participantId )

    # print('================================================================================')
    # print("getParticipantInfo")
    # print("query")
    # print(query)
    # print('================================================================================')

    cursor.execute(query)
    # print(cursor)

    # result = result[0] if len(result) > 0 else NULL

    result = tatami_one_fetch(cursor, champType, '111')
    result = result[0] if len(result) > 0 else None

    return result

