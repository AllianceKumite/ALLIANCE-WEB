from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import traceback as tb

from fight.helpers import *

def getAllTimes(title):
    cursor = connection.cursor()
    query = f'SELECT DISTINCT Time FROM {title}_category ORDER BY Time'
    cursor.execute(query)

    result = cursor.fetchall()
    result = [x[0] for x in result]

    return result

def getKata(title):
    cursor = connection.cursor()
    query = f'SELECT KataId, KataNameEn, KataNameRu, KataNameUa FROM {title}_kata ORDER BY KataId'
    cursor.execute(query)

    # result = cursor.fetchall()
    result = dict_fetch_all(cursor)
    # result = list(result)

    # result = [x[0] for x in result]

    return result

def getLevelKata(title):
    cursor = connection.cursor()
    query = f'SELECT KataGrpId, AlwaysNoRepet, KataGrpNameEn, KataGrpNameRu, KataGrpNameUa, KataGrpMandatList, KataGrpChooseList FROM {title}_katagroup ORDER BY KataGrpId'
    cursor.execute(query)

    result = dict_fetch_all(cursor)
    # result = [x[0] for x in result]

    return result

# if winner is set to None - it means that we dont know it but we need it
# if winner is not set - 'aka' is taken for winner
def getFightDetails(title, fightOwnId, winner = "aka"):
    cursor = connection.cursor()

    # get winner id, NextDuel
    columnWinner = 'AthIdRed' if winner == 'aka' else 'AthIdWhite'
    columnLooser = 'AthIdWhite' if winner == 'aka' else 'AthIdRed'
    # where = f'WHERE NumDuel = {fightNumDuel} AND CategoryId = {categoryId}'
    where = f'WHERE {title}_champ.ownId = {fightOwnId} '

    query  = (f'SELECT ' +
        f'{columnWinner}, NumDuel, NextDuel, {title}_champ.CategoryId, TatamiId, WinnerRed, WinnerWhite, {title}_category.Time, Level, {columnLooser}, {title}_category.CategoryBlockCount ' +
        f'FROM {title}_champ ' +
        f'JOIN {title}_category ON {title}_champ.CategoryId = {title}_category.categoryId ' +
        where
    )

    cursor.execute(query)

    result = cursor.fetchall()[0]

    if (winner == None):
        # we need it - define it
        if (result[5] == 1):
            query  = f'SELECT AthIdRed, AthIdWhite FROM {title}_champ {where}'

            cursor.execute(query)
            fetched = cursor.fetchall()

            result = list(result)
            result[0] = fetched[0][0] # set winner
            result[9] = fetched[0][1] # set looser

            result = tuple(result)

    return result


def setDoneKata(title, athId, kataId, level):
    cursor = connection.cursor()
    column =(f'lvl{level}')
    # print(column)

    query  = (f'UPDATE {title}_athchamp ' +
              f'SET {column} = {kataId} ' +
              f'WHERE athId = {athId} '
    )
    # print(query)
    cursor.execute(query)

# Для записи в таблице *_champ устанавливаем поле WinnerRed или WinnerWhite в состояние TRUE.
# 3. Для записи в таблице *_champ устанавливаем поле DuelIsPlace в состояние TRUE.
def markWinnerForFight(title, fightOwnId, winner):
    cursor = connection.cursor()

    column =('WinnerRed'   if winner == 'aka' else
            ('WinnerWhite' if winner == 'shiro' else '' ))

    query  = (f'UPDATE {title}_champ ' +
              f'SET {column} = 1, DuelIsPlace = 1 ' +
              f'WHERE ownId = {fightOwnId} '
    )

    cursor.execute(query)


def unmarkWinnerForFight(title, fightOwnId):
    cursor = connection.cursor()

    query  = (f'UPDATE {title}_champ ' +
              f'SET WinnerRed = 0, WinnerWhite = 0, DuelIsPlace = 0 ' +
              f'WHERE ownId = {fightOwnId} '
    )

    cursor.execute(query)


# Находим запись в таблице *_athchamp с индексом AthId, равным индексу AthIdRed или
# AthIdWhite, смотря кто победитель, и увеличиваем значение поля CountWinner на 1.


def incrementAthStat(title, winnerId, points = None):
    incrementOrDecrementAthStat(title, winnerId, points, True)

def decrementAthStat(title, winnerId, points = None):
    incrementOrDecrementAthStat(title, winnerId, points, False)


#	5.	В этой же таблице увеличиваем значение поля
# CountVazary или CountIppon или CountRefery на 1
# в зависимости от количества полученных баллов.
# If points != None than circular category - update CountWinner, CountRefery, CountVazary, CountIppon, CountBall
# If points == None than olympic category - update only CountWinner
def incrementOrDecrementAthStat(title, winnerId, points, increment):
    cursor = connection.cursor()

    column = 'CountRefery' if points == 2 else (
             'CountVazary' if points == 3 else (
              'CountIppon' if points == 4 else None
    ))

	# 2.	Наращиваем значения поля TotalBal на величину Avg из таблицы *_champ. Поле TotalBal мы уже тоже добавили.
  # TotalBal is CountBall in our case

    columnQuery = f', {column}, CountBall ' if column else ''
    query = (f'SELECT CountWinner{columnQuery} FROM {title}_athchamp ' +
              f'WHERE athId = {winnerId}')

    cursor.execute(query)

    fetched = cursor.fetchall()
    # TODO: Error here - fetched length is 0 - never should occur??
    # TODO: Investigate it more!! when it happens
    fetched = fetched[0] if len(fetched) > 0 else 0

    # if (fetched != 0)

    if (increment) :
        countWinner = +(fetched[0]) + 1
        pointsColumn = (+(fetched[1]) + 1) if column else 0
        countBall = (+(fetched[2]) + points) if column else 0
    else :
        countWinner = +(fetched[0]) - 1
        countWinner = countWinner if countWinner >= 0 else 0
        pointsColumn = (+(fetched[1]) - 1) if column else 0
        pointsColumn = pointsColumn if pointsColumn >= 0 else 0
        countBall = (+(fetched[2]) - points) if column else 0
        countBall = countBall if int(countBall) >= 0 else 0

    columnQuery = f', {column} = {pointsColumn}, CountBall = {countBall}' if column else ''

    query = (f'UPDATE {title}_athchamp ' +
            f'SET CountWinner = {countWinner}{columnQuery} ' +
            f'WHERE athId = {winnerId}')

    cursor.execute(query)


def incrementAthStatWkb(title, winnerId, points):
    incrementOrDecrementAthStatWkb(title, winnerId, points, True)

def decrementAthStatWkb(title, winnerId, points):
    incrementOrDecrementAthStatWkb(title, winnerId, points, False)

def incrementOrDecrementAthStatWkb(title, winnerId, points, increment):
    cursor = connection.cursor()

    # 2.	Наращиваем значения поля TotalBal на величину Avg из таблицы *_champ. Поле TotalBal мы уже тоже добавили.
    # TotalBal is CountBall in our case

    query = (f'SELECT CountBallKata FROM {title}_athchamp ' +
              f'WHERE athId = {winnerId}')

    cursor.execute(query)

    fetched = cursor.fetchall()[0]

    if (increment) :
        countBall = (+(fetched[0]) + points["avg"])
    else :
        countBall = (+(fetched[0]) - points["avg"])

    query = (f'UPDATE {title}_athchamp ' +
            f'SET CountBallKata = {countBall} ' +
            f'WHERE athId = {winnerId}')

    cursor.execute(query)


# В таблице *_champ всегда есть 2 записи, у которых NextDuel одинаковые.
# Это логично, так как в следующий круг выходит победитель пары 1 и победитель пары 2.
# Соответственно индекс победитель пары No1 для NextDuel всегда должен попадать в AthIdRed
# следующего поединка (по NextDuel). Победитель пары No2 для NextDuel всегда
# должен попадать в AthIdWhite следующего поединка (по NextDuel).

# find both fights what have current NextDuel
def getDuelsWithGivenNextDuel(title, nextDuel, categoryId):
    cursor = connection.cursor()

    where = f'WHERE NextDuel = {nextDuel} AND CategoryId = {categoryId}'
    query = (f'SELECT NumDuel, AthIdRed, AthIdWhite FROM {title}_champ ' + where + ' ORDER BY LevePair asc, NumPair asc')
    cursor.execute(query)
    fetched = cursor.fetchall()

    # numDuels = []
    # for x in fetched:
    #   numDuels.append(x[0])

    numDuels = fetched

    return numDuels


def getAllCategoriesIdsOfType(title, type, tatami = None, time = None, blockCount = None):
    cursor = connection.cursor()

    filterByTatami = f"JOIN {title}_champ ON {title}_champ.CategoryId = {title}_category.categoryId AND {title}_champ.tatamiId = {tatami} " if tatami != None else ''
    filterByTime = f"AND {title}_category.Time = {time}" if time != None else ''
    filterByBlockCount = f"AND {title}_category.CategoryBlockCount = {blockCount}" if blockCount != None else ''

    query = (f"SELECT DISTINCT {title}_category.CategoryId " +
             f'FROM {title}_category {filterByTatami} ' +
             f"WHERE {title}_category.CategoryType = {type} {filterByTime} {filterByBlockCount}"
    )
    cursor.execute(query)
    fetched = cursor.fetchall()
    fetched = [str(x[0]) for x in fetched]

    return fetched

def getAllCategoriesIdsOfTypeOlimp(title, tatami = None, time = None, blockCount = None):
    cursor = connection.cursor()

    filterByTatami = f"JOIN {title}_champ ON {title}_champ.CategoryId = {title}_category.categoryId AND {title}_champ.tatamiId = {tatami} " if tatami != None else ''
    filterByTime = f"AND {title}_category.Time = {time}" if time != None else ''
    filterByBlockCount = f"AND {title}_category.CategoryBlockCount = {blockCount}" if blockCount != None else ''

    query = (f"SELECT DISTINCT {title}_category.CategoryId " +
             f'FROM {title}_category {filterByTatami} ' +
             f"WHERE {title}_category.CategoryType = 0 or {title}_category.CategoryType = 2 {filterByTime} {filterByBlockCount}"
    )
    cursor.execute(query)
    fetched = cursor.fetchall()
    fetched = [str(x[0]) for x in fetched]

    return fetched

def getAllOlympicCategoriesIds(title, tatami = None, time = None):
    return getAllCategoriesIdsOfTypeOlimp(title, tatami = tatami, time = time)

def getAllWkbCategoriesIds(title, tatami = None, time = None):
    return getAllCategoriesIdsOfType(title, 3, tatami = tatami, time = time)

def getAllKankuCategoriesIds(title, tatami = None, time = None):
    return getAllCategoriesIdsOfType(title, 1, tatami = tatami, time = time, blockCount = 2)


def getNextDuels(title, category):
    cursor = connection.cursor()
    query = (f'SELECT DISTINCT NextDuel FROM {title}_champ ' +
            f'WHERE CategoryId = {category} AND NextDuel > 0 ' +
            f'ORDER BY NextDuel ASC')

    cursor.execute(query)
    fetched = cursor.fetchall()
    fetched = [str(x[0]) for x in fetched]

    return fetched

def getNumDuelFor3Place(title, category):
    cursor = connection.cursor()
    query = (f'SELECT DISTINCT NumDuel FROM {title}_champ ' +
            f'WHERE CategoryId = {category} AND Level = 8 ' )

    cursor.execute(query)
    fetched = cursor.fetchall()
    fetched = [str(x[0]) for x in fetched]

    return fetched


'''
@returns all ownIds of category athlethes that has at last one win
'''
def getCategoryWinners(title, category):
    cursor = connection.cursor()
    query = ('SELECT DISTINCT * ' +
                'FROM (' +
                    'SELECT DISTINCT AthIdRed ' +
                    f'FROM {title}_champ ' +
                    f'WHERE DuelIsPlace = 1 AND WinnerRed = 1 AND categoryId = {category} ' +
                        'UNION ALL ' +
                    'SELECT DISTINCT AthIdWhite ' +
                    f'FROM {title}_champ ' +
                    f'WHERE DuelIsPlace = 1 AND WinnerWhite = 1 AND categoryId = {category} ' +
                ') a'
    )

    cursor.execute(query)
    fetched = cursor.fetchall()
    fetched = [str(x[0]) for x in fetched]

    return fetched


'''
@returns all ownIds of category athlethes that has at last one loss
'''
def getCategoryLoosers(title, category):
    cursor = connection.cursor()
    query = ('SELECT DISTINCT * ' +
                'FROM (' +
                    'SELECT DISTINCT AthIdRed ' +
                    f'FROM {title}_champ ' +
                    f'WHERE DuelIsPlace = 1 AND WinnerWhite = 1 AND categoryId = {category} AND AthIdRed != -1 ' +
                        'UNION ALL ' +
                    'SELECT DISTINCT AthIdWhite ' +
                    f'FROM {title}_champ ' +
                    f'WHERE DuelIsPlace = 1 AND WinnerRed = 1 AND categoryId = {category} AND AthIdWhite != -1 ' +
                ') a'
    )

    cursor.execute(query)
    fetched = cursor.fetchall()

    fetched = [str(x[0]) for x in fetched]

    return fetched


def getAutoPassedWinners(title, category) :
    cursor = connection.cursor()
    query = ('SELECT AthIdRed ' +
            f'FROM {title}_champ ' +
            f'WHERE NumDuel = 0 AND CategoryId = {category} AND AthIdRed > 0'
    )

    cursor.execute(query)
    fetched = cursor.fetchall()
    fetched = [str(x[0]) for x in fetched]

    return fetched


def switchWinnerToBeAtAkaPosition(title, fightOwnId, winner, winnerId):
    cursor = connection.cursor()

    if winner == 'white':
      # where = f'WHERE NumDuel = {fightNumDuel} AND CategoryId = {categoryId}'
      where = f'WHERE ownId = {fightOwnId}'
      # needs swapping
      query  = (f'SELECT AthIdRed, NextDuel FROM {title}_champ ' + where)
      cursor.execute(query)
      athRedId = cursor.fetchall()[0]

      query = (f'UPDATE {title}_champ' +
            f'SET AthIdRed = {winnerId}, AthIdWhite = {athRedId} ' +
            where)
      cursor.execute(query)


def setAthFinalOr3PlaceFight(champName, category, athRed, athWhite, isFinal = True):
    cursor = connection.cursor()
    level = 12 if isFinal else 8

    query = ( f'UPDATE {champName}_champ ' +
          f'SET AthIdRed = {athRed}, AthIdWhite = {athWhite} ' +
          f'WHERE {champName}_champ.Level = {level} AND CategoryId = {category}')

    cursor.execute(query)
    fedched = cursor.fetchall()
    fedched = fedched[0] if len(fedched) > 0 else 0

    return fedched


# .	В зависимости от типа победы устанавливаем поле pointsRed или pointsWhite в одно из зна- чений:
# 		  Если по решению судей – устанавливаем равным 2.
# 		  Если вазари – устанавливаем равным 3.
# 		  Если иппон – устанавливаем равным 4.
# for Circle category
def setFightPointsCircle(title, fightOwnId, winner, points):
    cursor = connection.cursor()
    column = 'pointsRed' if winner == 'aka' else 'pointsWhite'
    query = (f'UPDATE {title}_champ ' +
            f'SET {column} = {points} ' +
            f'WHERE ownId = {fightOwnId} ')
    cursor.execute(query)

def setFightPointsWkb(title, fightOwnId, winner, points):
    cursor = connection.cursor()

    query = (f'UPDATE {title}_champ ' +
            f'SET Refery1 = {points["judge1"]},  ' +
                f'Refery2 = {points["judge2"]},  ' +
                f'Refery3 = {points["judge3"]},  ' +
                f'Refery4 = {points["judge4"]},  ' +
                f'Refery5 = {points["refery"]},  ' +
                f'Avg = {points["avg"]}  ' +
            f'WHERE ownId = {fightOwnId} ')
    cursor.execute(query)

def getAndCleanupFightPointsWkb(title, fightOwnId, winner):
    cursor = connection.cursor()
    query = (f'SELECT Avg FROM {title}_champ ' +
            f'WHERE ownId = {fightOwnId} ')
    cursor.execute(query)

    points = cursor.fetchall()[0][0]

    query = (f'UPDATE {title}_champ ' +
            f'SET Avg = 0, Refery1 = 0, Refery2 = 0, Refery3 = 0, Refery4 = 0, Refery5 = 0 ' +
            f'WHERE ownId = {fightOwnId} ')
    cursor.execute(query)

    return {"avg":points}


def getAndCleanupFightPoints(title, fightOwnId, winner):
    cursor = connection.cursor()
    column = 'pointsRed' if winner == 'aka' else 'pointsWhite'
    query = (f'SELECT {column} FROM {title}_champ ' +
            f'WHERE ownId = {fightOwnId} ')
    cursor.execute(query)

    points = cursor.fetchall()[0][0]

    query = (f'UPDATE {title}_champ ' +
            f'SET {column} = 0 ' +
            f'WHERE ownId = {fightOwnId} ')
    cursor.execute(query)

    return points


def areAllCategoryFightsFinished(title, categoryId) :
    cursor = connection.cursor()
    queryAmount = (f'SELECT COUNT(*) FROM {title}_champ WHERE categoryId = {categoryId} AND NumDuel > 0')
    cursor.execute(queryAmount)
    fightsAmount = cursor.fetchall()[0]

    queryPassed = queryAmount + ' AND DuelIsPlace = 1'
    cursor.execute(queryPassed)
    fightsPassed = cursor.fetchall()[0]

    categoryFinished = fightsAmount == fightsPassed
    return categoryFinished

  #  При круговой системе у каждого спортсмена общее количество поединков равно (количество участников в категории – 1). Пусть это будет maxCountWinner.
  #  Формируем список участников категории или делаем запрос – это неважно. Глав- ное, что мы должны иметь какой-то список в котором будет присутствовать AthId участника категории.
  #  В таблице *_athchamp пытаемся найти спортсмена, у которого CountWinner равно maxCountWinner. Если такой есть – он занимает 1-е место.
  #  Если такого нет – упорядочиваем список спортсменов категории по «количество по- бед + количество набранных баллов». Для этого используем значения полей Coun- tWinner и TotalBal таблицы *_athchamp.
  #  Если есть несколько спортсменов с одинаковым количеством балов – смотрим ре- зультат личной встречи. Тот, кто выиграл – тот выше по месту.
  #  Особый случай, когда в категории 3 человека и каждый выиграл у каждого. Т.е. у каждого по одной победе и все победы по решению судей. У них будет по одной победе и по 2 бала. В таком случае 1-е место у самого легкого, 2-е у более тяжелого и 3-е у самого тяжелого.
  #
  # Based on above algorithm:
  # SQL Query for sorting athletes by places for circular category
  #
  # SELECT ownId from (
  #   SELECT DISTINCT ownId, CountWinner, CountBall, Weight FROM (
  # 	  SELECT DISTINCT cup_wkb_12_02_2022_champ.AthIdWhite
  #  	  FROM cup_wkb_12_02_2022_champ
  #   	WHERE cup_wkb_12_02_2022_champ.CategoryId = 23
  # 	  UNION ALL
  #  	  SELECT DISTINCT cup_wkb_12_02_2022_champ.AthIdRed
  #   	FROM cup_wkb_12_02_2022_champ
  # 	  WHERE cup_wkb_12_02_2022_champ.CategoryId = 23
  #   ) as tmp
  #   JOIN cup_wkb_12_02_2022_athchamp ON AthIdWhite = cup_wkb_12_02_2022_athchamp.ownId
  #   ORDER BY CountWinner DESC, CountBall DESC, Weight ASC
  # ) as tmp2

def prepareResultsForCircular(title, categoryId):
  cursor = connection.cursor()

# CountWinner, CountBall, Weight
  query = (
    'SELECT ownId from (' +
      'SELECT DISTINCT ownId, CountWinner, CountBall, Weight FROM ( ' +
        f'SELECT DISTINCT {title}_champ.AthIdWhite ' +
        f'FROM {title}_champ ' +
        f'WHERE {title}_champ.CategoryId = {categoryId} ' +
        'UNION ALL ' +
        f'SELECT DISTINCT {title}_champ.AthIdRed ' +
        f'FROM {title}_champ ' +
        f'WHERE {title}_champ.CategoryId = {categoryId} ' +
      ') as tmp ' +
      f'JOIN {title}_athchamp ON AthIdWhite = {title}_athchamp.athId ' +
      'ORDER BY CountWinner DESC, CountBall DESC, Weight ASC ' +
    ') as tmp2')

  cursor.execute(query)

  # at firstposition first place
  return cursor.fetchall()

# TODO: Find better name for this
def getFinalFightParticipantsSortedByWinner(title, categoryId, level):
    participants = []
    cursor = connection.cursor()
    query = (f'SELECT AthIdRed, AthIdWhite, WinnerRed, WinnerWhite FROM {title}_champ WHERE categoryId = {categoryId} AND Level = {level} AND NumDuel > 0')
    cursor.execute(query)
    fetched = cursor.fetchall()
    if (len(fetched) > 0):
        if (level == 12 or level == 8):
            finalFight = fetched[0]

            if (finalFight[2] == 1): # WinnerRed
                participants.append(finalFight[0])
                participants.append(finalFight[1])
            elif (finalFight[3] == 1): # WinnerWhite
                participants.append(finalFight[1])
                participants.append(finalFight[0])
        elif (level == 7):
            # Two fetched rows (fights)
            # select two loosers - they share 3 and 4 places (if olympic only)
            # If not olympic - use case with level == 7 not applicable
            fight0 = fetched[0]

            if(len(fetched) > 1):
              fight1 = fetched[1]

            if (fight0[2] == 1):
                # if winner is red
                # then append with id of white
                participants.append(fight0[1])
            elif (fight0[3] == 1):
                # if winner is white
                # then append with id of red
                participants.append(fight0[0])

            if(len(fetched) > 1):
                if (fight1[2] == 1):
                    participants.append(fight1[1])
                elif (fight1[3] == 1):
                    participants.append(fight1[0])

    return participants


def defineCategoryPlacesOlympic(title, categoryId):
    winners12 = getFinalFightParticipantsSortedByWinner(title, categoryId, 12)
    winners34 = getFinalFightParticipantsSortedByWinner(title, categoryId, 8)
    if len(winners34) == 0:
        # If there is no third place fight then
        # two loosers of 7 level fights - form winners34 (athletes that share 3 and 4-th place)
        winners34 = getFinalFightParticipantsSortedByWinner(title, categoryId, 7)

    return winners12 + winners34

def defineCategoryPlacesWkb(title, categoryId):
    winners12 = getFinalFightParticipantsSortedByWinner(title, categoryId, 12)
    winners34 = getFinalFightParticipantsSortedByWinner(title, categoryId, 8)

    if (len(winners34) == 0):
        # If there is no third place fight but there are 3 participants in semifinals
        # then this third participant takes third place
        category3Place = defineCategory3PlaceWkb(title, categoryId)
        winners34 = [] if category3Place == None else [category3Place]

    return winners12 + winners34

def defineCategory3PlaceWkb(champName, categoryId):
    thirdPlace = None
    passedFightsOfCurrentLevel = filterFights(champName, category = categoryId, level = 7, futureFightsOnly = False, skipNumDuelOForWkbDraw = True, skipWkbDesqualified = True)

    # for WKB Number of fights is the same as number of participants
    if (len(passedFightsOfCurrentLevel) == 3):
        # If amount of participants of prelast level is 3 -
        # the first two participants go to final fight (see 2 lines above)
        # and the third goes directly to third place winner position (and has no fights anymore)
        thirdPlace = passedFightsOfCurrentLevel[2]["AthIdRed"]

    return thirdPlace

# unused
def fillInCategory3PlaceWkb(champName, fightDetails):
    thirdPlace = defineCategory3PlaceWkb(champName, fightDetails)
    # for WKB Number of fights is the same as number of participants

    if (thirdPlace != None):
          category = fightDetails[3]
          fillInCategoryPlace(champName, category, 3, thirdPlace)


def fillInCategoryPlace(title, categoryId, placeNumber, winnerAthId):
    updateWinners = 'idxAth' + str(placeNumber) + 'Place = ' + winnerAthId

    updateCategory(title, categoryId, updateWinners)

def fillInCategoryPlaces(title, categoryId, winners):
    updateWinners = [('idxAth' + str(i + 1) + 'Place = ' + str(winners[i])) for i in range(0, len(winners))]
    updateWinners = ', '.join(updateWinners)

    updateCategory(title, categoryId, updateWinners)


# private
def updateCategory(title, categoryId, columnsToUpdate):
    if (columnsToUpdate):
        cursor = connection.cursor()

        query = ( f'UPDATE {title}_category ' +
                  f'SET {columnsToUpdate} ' +
                  f'WHERE categoryId = {categoryId}' )

        cursor.execute(query)

# Oredered desc ids by CountBall and weight
def getCategoryParticipants(title, categoryId, typeCheckCircle, blockNum = None):
    cursor = connection.cursor()

    defineByPointsOnly = typeCheckCircle == 0
    defineByCountWonAndPoints = typeCheckCircle == 1

    countWinnerSelect = "a.CountWinner, " if defineByCountWonAndPoints else ''
    countWinnerOrderBy = "a.CountWinner DESC, " if defineByCountWonAndPoints else ''
    blockFilter = f" AND BlockNum = {blockNum}" if blockNum is not None else ''

    query  = (f'SELECT a.athId,  {countWinnerSelect} a.CountBall, a.Weight ' +
              f'FROM {title}_athchamp a ' +
              'JOIN ' +
              '(' +
                    f'SELECT AthIdRed as identity FROM {title}_champ WHERE categoryId = {categoryId} {blockFilter} ' +
                    'UNION DISTINCT ' +
                    f'SELECT AthIdWhite as identity FROM {title}_champ WHERE categoryId = {categoryId} {blockFilter} ' +
              ') b ' +
      'ON a.athId = b.identity ' +
      f'ORDER BY {countWinnerOrderBy} a.CountBall DESC, a.Weight ASC'
    )

    cursor.execute(query)

    participants = cursor.fetchall()
    participants = [str(p[0]) for p in participants]

    return participants

def getAthByStat(title, categoryId, blockNum = None, ids = None, countWinner = 1, countBall = 2):
    cursor = connection.cursor()
    countWinnerQuery = "CountWinner, " if countWinner != None else ''
    countWinnerFilter = f"CountWinner = {countWinner} AND " if countWinner != None else ''
    idsFilter = ("athId IN (" + ', '.join(ids) + ') AND ') if ids != None else ''
    blockFilter = f"BlockNum = {blockNum} AND " if blockNum != None else ''

    query = (f'SELECT DISTINCT athId, {countWinnerQuery} CountBall, Weight ' +
             f'FROM {title}_athchamp ' +
             f'JOIN {title}_champ ON ({title}_athchamp.athId = {title}_champ.AthIdRed OR {title}_athchamp.athId = {title}_champ.AthIdWhite) ' +
             f'WHERE {idsFilter} {countWinnerFilter} {blockFilter}' +
                f'CountBall = {countBall} AND ' +
                f'{title}_champ.CategoryId = {categoryId}'
    )

    cursor.execute(query)

    athletes = cursor.fetchall()

    return athletes


def getFightOfAths(title, athletes):
    id1 = athletes[0][0]
    id2 = athletes[1][0]

    query = (f'SELECT ownId, AthIdRed, AthIdWhite, WinnerRed, WinnerWhite ' +
            f'FROM {title}_champ ' +
            f'WHERE ( DuelIsPlace = 1 AND ' +
                  f'(AthIdRed = {id1} AND AthIdWhite = {id2}) OR ' +
                  f'(AthIdRed = {id2} AND AthIdWhite = {id1}) )'
    )

    cursor = connection.cursor()
    cursor.execute(query)

    fights = cursor.fetchall()

    return fights[0] if len(fights) > 0 else None

def getWinnerFirstAndLooserLastOfFight(fight):
    winnerAndLooser = None

    if fight:
        winner = fight[1] if fight[3] == 1 else (
            fight[2] if fight[4] == 1 else None
        )

        looser = fight[1] if fight[4] == 1 else (
            fight[2] if fight[3] == 1 else None
        )

        winnerAndLooser = [winner, looser]

    return winnerAndLooser

def getResultOfPersonalMeeting(title, categoryId, blockNum = None, ids = None, countWinner = 1, countBall = 2):
    athletes = getAthByStat(title, categoryId, blockNum, ids, countWinner, countBall)
    fight = getFightOfAths(title, athletes)
    winnerLooser = getWinnerFirstAndLooserLastOfFight(fight)

    return winnerLooser

# TODO: Check if we can ommit it and use already sorted ids from
# getCategoryParticipants
def getResultOfSortedWeight(title, categoryId, blockNum = None, countWinner = 1, countBall = 2):
    cursor = connection.cursor()

    countWinnerQuery = "CountWinner, " if countWinner != None else ''
    countWinnerFilter = f"CountWinner = {countWinner} AND " if countWinner != None else ''
    blockFilter = f"BlockNum = {blockNum} AND " if blockNum != None else ''

    query = (f'SELECT DISTINCT athId, {countWinnerQuery} CountBall, Weight ' +
             f'FROM {title}_athchamp ' +
             f'JOIN {title}_champ ON ({title}_athchamp.athId = {title}_champ.AthIdRed OR {title}_athchamp.athId = {title}_champ.AthIdWhite) ' +
             f'WHERE {countWinnerFilter} {blockFilter} ' +
               f' CountBall = {countBall} AND ' +
               f' {title}_champ.CategoryId = {categoryId} ' +
            f'ORDER BY Weight ASC'
    )

    cursor.execute(query)
    athletes = cursor.fetchall()

    return [x[0] for x in athletes]

# Returns statictics and how many are identical records in statictics
def getParticipantsStatistics(title, ids, typeCheckCircle):
    defineByPointsOnly = typeCheckCircle == 0
    defineByCountWonAndPoints = typeCheckCircle == 1

    cursor = connection.cursor()

    whereClause = 'athId = ' + ' or athId = '.join(ids)
    selectClause = 'CountWinner,' if defineByCountWonAndPoints else ''
    orderByClause = 'CountWinner DESC,' if defineByCountWonAndPoints else ''
    groupByClause = 'CountWinner,' if defineByCountWonAndPoints else ''

    query = (f'SELECT {selectClause} CountBall, COUNT(*) FROM {title}_athchamp WHERE {whereClause} ' +
             f'GROUP BY {groupByClause} CountBall ' +
            #  f'HAVING COUNT(*) > 1 ' +
             f'ORDER BY {orderByClause} CountBall DESC '
    )

    cursor.execute(query)

    stats = cursor.fetchall()

    return stats


def sortParticipantsByStatistics(title, categoryId, ids, stats, typeCheckCircle, blockNum = None):
    defineByCountWonAndPoints = typeCheckCircle == 1
    arranged = []
    shift = 0

    for i in range(0, len(ids)):
        if ((int(ids[i]) in arranged) or (ids[i] in arranged)):
            # shift = shift + 1
            pass
        else:
            stat = stats[i - shift]

            identicalStatAmountPosition = 1 + typeCheckCircle
            pointsPosition = typeCheckCircle

            # If amount of identical points is 1 (no identical points)
            if (stat[identicalStatAmountPosition] == 1):
                arranged.append(int(ids[i]))
            elif (stat[identicalStatAmountPosition] == 2):
                # If amount of identical points is 2
                personalResult = getResultOfPersonalMeeting(
                    title,
                    categoryId,
                    blockNum = blockNum,
                    ids = ids,
                    countWinner = stat[0] if defineByCountWonAndPoints else None,
                    countBall = stat[pointsPosition]
                )

                if (personalResult != None):
                    arranged = arranged + personalResult
                else:
                    arranged = arranged + [ids[i], ids[i + 1]]

                shift = shift + 1
            elif (stat[identicalStatAmountPosition] > 2):
                # If amount of results with identical points more than 2
                arranged = arranged + getResultOfSortedWeight(
                    title,
                    categoryId,
                    blockNum = blockNum,
                    countWinner = stat[0] if defineByCountWonAndPoints else None,
                    countBall = stat[pointsPosition]
                )
                shift = shift + stat[identicalStatAmountPosition] - 1

    return arranged

def getAndSortAthIdsByStat(title, categoryId, ids, typeCheckCircle, blockNum = None):
  stats = getParticipantsStatistics(title, ids, typeCheckCircle)
  ids = sortParticipantsByStatistics(title, categoryId, ids, stats, typeCheckCircle, blockNum)

  return ids

def defineCategoryPlacesCircle(title, categoryId = None, blockNum = None):
    typeCheckCircle = getTypeCheckCircle(title)
    ids = getCategoryParticipants(title, categoryId, typeCheckCircle, blockNum)
    winners = getAndSortAthIdsByStat(title, categoryId, ids, typeCheckCircle, blockNum)

    return winners

def defineCategoryPlacesKanku(title, categoryId):
    winners12 = getFinalFightParticipantsSortedByWinner(title, categoryId, 12)
    winners34 = getFinalFightParticipantsSortedByWinner(title, categoryId, 8)

    if (len(winners34) == 0):
        winners34 = defineAth3PlaceFightKanku(title, categoryId)

    return winners12 + winners34

def getCategoryDetails(title, categoryId = None):
    cursor = connection.cursor()
    query  = (f'SELECT CategoryType, CategoryBlockCount FROM {title}_category WHERE categoryId = {categoryId}')
    cursor.execute(query)
    categoryDetails = cursor.fetchall()[0]

    return {"type": categoryDetails[0], "blocks": categoryDetails[1]}

def isCategoryOlypic(categoryDetails):
  return categoryDetails["type"] == 0 or categoryDetails["type"] == 2

def isCategoryCircle(categoryDetails):
  return categoryDetails["type"] == 1 and categoryDetails["blocks"] == 1

def isCategoryWkb(categoryDetails):
  return categoryDetails["type"] == 3

def isCategoryWkbFinalOr3PlaceFight(categoryDetails, fightDetails):
  return isCategoryWkb(categoryDetails) and isFinalOr3PlaceFight(fightDetails)

# Kanku kategory is category that consitts from 2 circle  blocks
# winners of which meet up in one olympic  final
def isCategoryKanku(categoryDetails):
  return categoryDetails["type"] == 1 and categoryDetails["blocks"] == 2


def isCategoryKankuFinalOr3PlaceFight(categoryType, fightDetails):
    return isCategoryKanku(categoryType, fightDetails) and isFinalOr3PlaceFight(fightDetails)

def isCategoryKankuNotFinalOr3PlaceFight(categoryType, fightDetails):
    return isCategoryKanku(categoryType, fightDetails) and not isFinalOr3PlaceFight(fightDetails)

def isFinalOr3PlaceFight(fight):
    # print('ffff')
    level = fight[8]
    # print(level)

    isFinalOr3PlaceFight = level == 8 or level == 12
    # print(isFinalOr3PlaceFight)
    return isFinalOr3PlaceFight


    # Not used here,
    # Shold be used where results are shown (draws, results)
    # if areAllCategoryFightsFinished(title, categoryId) :
        # prepareResultsForCircular()

# Used in olympic
def checkIfNextFightAlreadyHasPlace(title, fightOwnId):
    details = getFightDetails(title, fightOwnId)
    nextDuel = details[2]
    categoryId = details[3]
    tatamiId = details[4]

    cursor = connection.cursor()

    query  = (f'SELECT DuelIsPlace ' +
        f'FROM {title}_champ ' +
        # f'{timeJoin} ' +
        f'JOIN {title}_category ON {title}_champ.CategoryId = {title}_category.CategoryId ' +
        # TODO: and time is current
        f'WHERE NumDuel = {nextDuel} AND {title}_champ.CategoryId = {categoryId} AND TatamiId = {tatamiId} AND DuelIsPlace = 1'
    )

    cursor.execute(query)

    hasPlace = len(cursor.fetchall()) > 0

    return hasPlace


def checkIfFightFromNextLevelAlreadyHasPlace(title, fightDetails):
    categoryId = fightDetails[3]
    level = fightDetails[8]
    nextLevel = level + 1 if (level < 8) else (12 if level == 8 else None)

    return checkIfFightFromLevelHadPlace(title, categoryId, nextLevel)


# def checkIfFightFromLevelHadPlace(title, tatamiId, categoryId, level):
def checkIfFightFromLevelHadPlace(title, categoryId, level):
    hasPlace = False

    if (level != None):
        cursor = connection.cursor()

        # TODO: Dont't need so complicated query, recheck, remove it and use more simple query from below
        query  = (f'SELECT Count(*) ' +
            f'FROM {title}_champ ' +
            f'JOIN {title}_tatami ON {title}_champ.TatamiId = {title}_tatami.id ' +
            f'JOIN {title}_category ON {title}_champ.CategoryId = {title}_category.CategoryId ' +
            # TODO: and time is current
            f'WHERE Level = {level} AND {title}_champ.CategoryId = {categoryId} ' +
                f'AND TatamiId = tatamiId AND DuelIsPlace = 1 AND NumDuel != 0'
        )

        query  = (f'SELECT Count(*) ' +
            f'FROM {title}_champ ' +
            f'WHERE Level = {level} AND {title}_champ.CategoryId = {categoryId} ' +
                f' AND DuelIsPlace = 1 AND NumDuel != 0 AND NOT (AthIdWhite = -1 AND AthIdRed = -1)'
        )

        cursor.execute(query)

        hasPlace = cursor.fetchall()[0][0]
        hasPlace = int(hasPlace) > 0

    return hasPlace


def isCancelingAllowedForOlympic(title, fightOwnId):
  return not checkIfNextFightAlreadyHasPlace(title, fightOwnId)


def isCancelingAllowedForWkb(title, fightDetails):
    return not checkIfFightFromNextLevelAlreadyHasPlace(title, fightDetails)


def isCancelingAllowedForKanku(title, fightDetails):
    return isFinalOr3PlaceFight(fightDetails) or not finalOr3PlaceFightHadPlace(title, fightDetails[3])


def finalOr3PlaceFightHadPlace(title, categoryId) :
    return ( checkIfFightFromLevelHadPlace(title, categoryId, 8) or
             checkIfFightFromLevelHadPlace(title, categoryId, 12)  )


def cleanupChampAndAthStats(title, tatami = None, time = None):
    # print("cleanupChampAndAthStats")
    cursor = connection.cursor()

    tatamiFilter = f"tatamiId = {tatami}" if tatami != None else "TRUE"
    timeFilter = f"categoryId IN (SELECT DISTINCT categoryId FROM {title}_category WHERE Time = {time}) " if time != None else "TRUE"

    query = (f'UPDATE {title}_champ ' +
              f'SET ' +
                'DuelIsPlace = 0, WinnerRed = 0, WinnerWhite = 0, '  +
                'Chu1R = 0, Chu2R = 0, Chu3R = 0, Vaz1R = 0, Vaz2R = 0, IpponR = 0, ' +
                'Chu1W = 0, Chu2W = 0, Chu3W = 0, Vaz1W = 0, Vaz2W = 0, IpponW = 0, ' +
                'PointsRed = 0, PointsWhite = 0, ' +
                'Refery1 = 0, Refery2 = 0, Refery3 = 0, Refery4 = 0, Refery5 = 0, Avg = 0 ' +
                f'WHERE NumDuel != 0 AND {tatamiFilter} AND {timeFilter}'
    )

    # print("======================================================")
    # print(query)

    cursor.execute(query)

    tatamiFilter = (f"athId IN (" +
        f'( SELECT DISTINCT AthIdRed FROM {title}_champ WHERE tatamiId = {tatami} ) ' +
        f' UNION ' +
        f'( SELECT DISTINCT AthIdWhite FROM {title}_champ WHERE tatamiId = {tatami} ) ' +
      ')') if tatami != None else "TRUE"

    timeFilter = (f"athId IN (" +
        f'( SELECT DISTINCT AthIdRed FROM {title}_champ JOIN {title}_category ON {title}_champ.categoryId = {title}_category.categoryId AND {title}_category.Time = {time} ) ' +
        f' UNION ' +
        f'( SELECT DISTINCT AthIdWhite FROM {title}_champ JOIN {title}_category ON {title}_champ.categoryId = {title}_category.categoryId AND {title}_category.Time = {time}  ) ' +
    ")") if tatami != None else "TRUE"

    query = (f'UPDATE {title}_athchamp ' +
              f'SET ' +
              'CountRefery = 0, CountVazary = 0, CountIppon = 0, CountWinner = 0, CountBall = 0 ' +
              f'WHERE {tatamiFilter} AND {timeFilter}'
    )

    # print("======================================================")
    # print(query)

    cursor.execute(query)


def clearCategoryPlaces(title, tatami = None, time = None, category = None):
    cursor = connection.cursor()

    categoryFilter = f"categoryId = {category} " if category != None else 'TRUE'
    timeFilter = f"Time = {time} " if time != None else 'TRUE'
    tatamiFilter = f"categoryId IN (SELECT DISTINCT CategoryId FROM {title}_champ WHERE TatamiId = {tatami} ) " if tatami != None else 'TRUE'

    query = (f'UPDATE {title}_category ' +
        f'SET ' +
        'idxAth1Place = -1, idxAth2Place = -1, idxAth3Place = -1, idxAth4Place = -1, ' +
        'idxAth5Place = -1, idxAth6Place = -1, idxAth7Place = -1, idxAth8Place = -1 ' +
         f"WHERE {categoryFilter} AND {timeFilter} AND {tatamiFilter}"
    )

    cursor.execute(query)

def clearCategoryPlacesWKB(title, level, tatami = None, time = None, category = None):
    cursor = connection.cursor()

    categoryFilter = f"categoryId = {category} " if category != None else 'TRUE'
    timeFilter = f"Time = {time} " if time != None else 'TRUE'
    tatamiFilter = f"categoryId IN (SELECT DISTINCT CategoryId FROM {title}_champ WHERE TatamiId = {tatami} ) " if tatami != None else 'TRUE'

    if(level == 8):
        query = (f'UPDATE {title}_category ' +
            f'SET ' +
            'idxAth3Place = -1, idxAth4Place = -1, ' +
            'idxAth5Place = -1, idxAth6Place = -1, idxAth7Place = -1, idxAth8Place = -1 ' +
            f"WHERE {categoryFilter} AND {timeFilter} AND {tatamiFilter}"
        )
    if(level == 12):
        query = (f'UPDATE {title}_category ' +
            f'SET ' +
            'idxAth1Place = -1, idxAth2Place = -1, ' +
            'idxAth5Place = -1, idxAth6Place = -1, idxAth7Place = -1, idxAth8Place = -1 ' +
            f"WHERE {categoryFilter} AND {timeFilter} AND {tatamiFilter}"
        )

    cursor.execute(query)

def clearCategoryPlacesIfNeededOlympic(title, categoryId, level):
    # If we cancel final or place for 3-rd place then cleanup category winners
    if ((level == 12) or (level == 8)):
        clearCategoryPlaces(title, category = categoryId)

def clearCategoryPlacesIfNeededWKB(title, categoryId, level):
    # If we cancel final or place for 3-rd place then cleanup category winners
    if ((level == 12) or (level == 8)):
        clearCategoryPlacesWKB(title, level, category = categoryId)

def clearCategoryPlacesIfNeededCircle(title, categoryId, level):
    # If we cancel any fight then cleanup category winners
    clearCategoryPlaces(title, category = categoryId)


def clearCategoryPlacesIfNeededWkb(title, categoryId, level):
    clearCategoryPlaces(title, category = categoryId)


def getNextWkbLevel(level = None):
    nextLevel = (
          level + 1 if level < 8 else
          (12 if level == 8 else
          -1)
      )

    return nextLevel


def getFightsLevels(champName, fightOwnIds):
    levels = []

    if (len(fightOwnIds) > 0):
        cursor = connection.cursor()
        whereClause = 'WHERE ownId = ' + ' or ownId = '.join(fightOwnIds) if len(fightOwnIds) > 0 else ''

        query = f"SELECT DISTINCT Level, CategoryId FROM {champName}_champ {whereClause}"

        cursor.execute(query)
        levels = cursor.fetchall()

    return levels


def selectAthForFinalAnd3PlaceFightKanku(champName, fightDetails):
    winners1 = defineCategoryPlacesCircle(champName, categoryId = fightDetails[3], blockNum = 1 )
    winners2 = defineCategoryPlacesCircle(champName, categoryId = fightDetails[3], blockNum = 2 )

    typeCheckCircle = getTypeCheckCircle(champName)
    finalAths = [str(winners1[0]), str(winners2[0])]
    finalAths = getAndSortAthIdsByStat(champName, fightDetails[3], finalAths, typeCheckCircle)

    place3FightAths = [str(winners1[1]), str(winners2[1])]
    place3FightAths = getAndSortAthIdsByStat(champName, fightDetails[3], place3FightAths, typeCheckCircle)


    setAthFinalOr3PlaceFight(champName, fightDetails[3], finalAths[1], finalAths[0], isFinal = True)
    setAthFinalOr3PlaceFight(champName, fightDetails[3], place3FightAths[1], place3FightAths[0], isFinal = False)


def defineAth3PlaceFightKanku(champName, categoryId):
    winners1 = defineCategoryPlacesCircle(champName, categoryId = categoryId, blockNum = 1 )
    winners2 = defineCategoryPlacesCircle(champName, categoryId = categoryId, blockNum = 2 )

    place3FightAths = [winners1[1], winners2[1]]

    return place3FightAths


def updateSwitchers(title, fight, akaShiro, switchers):
    cursor = connection.cursor()

    query = (f'UPDATE {title}_champ ' +
            f'SET ' +
              f'Chu1{akaShiro} = {switchers[0]}, ' +
              f'Chu2{akaShiro} = {switchers[1]}, ' +
              f'Chu3{akaShiro} = {switchers[2]}, ' +
              f'Vaz1{akaShiro} = {switchers[3]}, ' +
              f'Vaz2{akaShiro} = {switchers[4]}, ' +
              f'Ippon{akaShiro} = {switchers[5]} ' +
            f'WHERE ownId = {fight}'
    )

    cursor.execute(query)

    return cursor.fetchall()

def getTypeCheckCircle(title):
    cursor = connection.cursor()

    query = (f'SELECT typeCheckCircle ' +
             f'FROM champs '
             f'WHERE title = "{title}"'
    )

    cursor.execute(query)
    fetched = cursor.fetchall()
    fetched = fetched[0][0] if len(fetched) > 0 else 0

    return fetched



# TODO: move to general helpers
def getPrintableInfo(e):
    return str(e) + '\n\r' + ''.join(tb.format_exception(None, e, e.__traceback__))


# TODO: move to general utils
def xor(lst1, lst2):
    lst3 = [value for value in lst1 if value not in lst2]

    return lst3
