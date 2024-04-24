from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import traceback as tb

from management.helpers import *
from fight.helpers import *


def setFightWinner(title, fightOwnId, winner = None, points = None, fightDetails = None, kataidAka = None, kataidShiro = None, level = None):
    categoryId = fightDetails[3]
    categoryDetails = getCategoryDetails(title, categoryId = categoryId)

    if (isCategoryOlypic(categoryDetails) or isCategoryWkbFinalOr3PlaceFight(categoryDetails, fightDetails) ) :
        setFightWinnerOlympic(title, fightOwnId, winner, fightDetails, kataidAka, kataidShiro, categoryDetails["type"])
    elif (isCategoryCircle(categoryDetails)) :
        setFightWinnerCircle(title, fightOwnId, winner, fightDetails, points)
    elif (isCategoryWkb(categoryDetails)) :
        setFightWinnerWkb(title, fightOwnId, winner, fightDetails, points)
    elif (isCategoryKanku(categoryDetails)) :
        setFightWinnerKanku(title, fightOwnId, winner, fightDetails, points, categoryDetails)

    if (areAllCategoryFightsFinished(title, categoryId)):
        if (isCategoryOlypic(categoryDetails)):
            winners = defineCategoryPlacesOlympic(title, categoryId)
        elif (isCategoryCircle(categoryDetails)):
            winners = defineCategoryPlacesCircle(title, categoryId = categoryId)
        elif (isCategoryWkb(categoryDetails)):
            winners = defineCategoryPlacesWkb(title, categoryId)
        elif (isCategoryKanku(categoryDetails)):
            winners = defineCategoryPlacesKanku(title, categoryId)

        fillInCategoryPlaces(title, categoryId, winners)


def cancelFightsByIds(title, fightOwnIds):
    notAllowed = []

    for fightOwnId in reversed(fightOwnIds):
        fightDetails = getFightDetails(title, fightOwnId, winner = None)
        categoryId = fightDetails[3]

        categoryDetails = getCategoryDetails(title, categoryId)

        if (isCategoryOlypic(categoryDetails)) :
            if (isCancelingAllowedForOlympic(title, fightOwnId)):
                cancelFightOlympic(title, fightOwnId, fightDetails)
            else:
                notAllowed.append(fightOwnId)
        elif (isCategoryCircle(categoryDetails)) :
            cancelFightCircle(title, fightOwnId, fightDetails)
        elif (isCategoryWkbFinalOr3PlaceFight(categoryDetails, fightDetails)) :
            cancelFightWkbFinal(title, fightOwnId, fightDetails)
        elif (isCategoryWkb(categoryDetails)) :
            if (isCancelingAllowedForWkb(title, fightDetails)):
                cancelFightWkb(title, fightOwnId, fightDetails)
            else:
                notAllowed.append(fightOwnId)
        elif isCategoryKanku(categoryDetails):
            if (isCancelingAllowedForKanku(title, fightDetails)):
                cancelFightKanku(title, fightOwnId, fightDetails)
            else:
                notAllowed.append(fightOwnId)

    return notAllowed


def calcelAllFights(title, tatami, time):
    # For olympic
    cleanLooserFromNextFights(title, tatami = tatami, time = time)
    cleanWinnerFromNextFights(title, tatami = tatami, time = time)

    # For circle do nothing

    # For WKB
    clearAthFromLevel(title, tatami = tatami, time = time, allLevelsExceptMin = True)

    # For Kanku
    clearAthFromFinalAnd3PlaceFight(title, tatami = tatami, time = time)

    # For All
    clearCategoryPlaces(title, tatami = tatami, time = time)
    cleanupChampAndAthStats(title, tatami = tatami, time = time)

    return []

def dict_fetch_all(cursor):
    desc = cursor.description
    array_of_dict = [
            dict(zip([col[0] for col in desc], [str(el) for el in row]))
            for row in cursor.fetchall()
    ]
    dict_to_return = {}
    it = 1
    for item in array_of_dict:
        dict_to_return[it] = item
        it += 1

    return dict_to_return

def postponeOrUnpostponeFights(title, fightOwnIds, postpone, activeTatami = None, categoryId = None, time = None):
    cursor = connection.cursor()

    duelHasPlace = 1 if postpone else 0

    fightsCondition = ''

    if fightOwnIds == -1 :
        if (activeTatami is None) :
            return False

        if postpone :
            fightsCondition = ' DuelIsPlace = 0 '
        else :
            fightsCondition = ' DuelIsPlace = 1 AND WinnerRed = 0 AND WinnerWhite = 0 '

    elif categoryId != None :
        fightsCondition = f'categoryId = {categoryId}'
        categoryInfo = getCategoryInfo(title, categoryId)

        activeTatami = categoryInfo["TatamiId"]
        time = categoryInfo["Time"]
    else :
        fightsCondition = 'ownId IN (' + ', '.join(fightOwnIds) + ')'
        fightDetails = getFightDetails(title, fightOwnIds[0])
        categoryId = fightDetails[3]
        activeTatami = fightDetails[4]
        time = fightDetails[7]

    query = (f'UPDATE {title}_champ ' +
        f'SET DuelIsPlace = {duelHasPlace} ' +
        f'WHERE {fightsCondition}'
    )

    cursor.execute(query)

    return {
        "time": time,
        "tatami": activeTatami,
    }


######################## Second level of detalization ####################################

def setFightWinnerOlympic(title, fightOwnId, winner, fightDetails, kataidAka = -1, kataidShiro = -1, categoryType = -1):
    winnerId = fightDetails[0]
    looserId = fightDetails[9]
    numDuel = fightDetails[1]
    nextDuel = fightDetails[2]
    categoryId = fightDetails[3]
    level = fightDetails[8]
    print('setFightWinnerOlympic')
    markWinnerForFight(title, fightOwnId, winner)
    incrementAthStat(title, winnerId)
    if categoryType == 2:
        if winner == 'shiro':
            athidshiro = winnerId;
            athidaka = looserId;
        if winner == 'aka':
            athidshiro = looserId;
            athidaka = winnerId;
        # print(athidshiro, athidaka)
        setDoneKata(title,athidaka, kataidAka, level)
        setDoneKata(title,athidshiro, kataidShiro, level)

    # Если указатель NextDuel меньше 0 – это поединок за 1-е или 3-е место.
    isFinalOr3PlaceFight = nextDuel < 0

    if (isFinalOr3PlaceFight):
        switchWinnerToBeAtAkaPosition(title, fightOwnId, winner, winnerId)
    else :
        # Same duels loosers go to fight for 3 place if level = 7
        duelsWithGivenNextDuel = getDuelsWithGivenNextDuel(title, nextDuel, categoryId)
        promoteWinnerToNextFight(title, nextDuel, numDuel, categoryId, duelsWithGivenNextDuel, winnerId)
        promoteLooserToNextFight(title, level,    numDuel, categoryId, duelsWithGivenNextDuel, looserId)


def setFightWinnerCircle(title, fightOwnId, winner, fightDetails, points):
    winnerId = fightDetails[0]
    print('setFightWinnerCircle')
    markWinnerForFight(title, fightOwnId, winner)
    setFightPointsCircle(title, fightOwnId, winner, points)
    incrementAthStat(title, winnerId, points = points)


def setFightWinnerWkb(title, fightOwnId, winner, fightDetails, points):
    winnerId = fightDetails[0]

    markWinnerForFight(title, fightOwnId, winner)
    setFightPointsWkb(title, fightOwnId, winner, points)
    incrementAthStatWkb(title, winnerId, points)

    promoteAthForNextLevelIfNeededWkb(title, fightDetails)


def setFightWinnerKanku(title, fightOwnId, winner, fightDetails, points, categoryDetails):
    print('setFightWinnerKanku')
    print(fightDetails)
    print('ffff')
    if isFinalOr3PlaceFight(fightDetails):
        print('111')
        setFightWinnerOlympic(title, fightOwnId, winner, fightDetails, -1, -1, -1)
    else:
        setFightWinnerCircle(title, fightOwnId, winner, fightDetails, points)

        promoteAthForFinalAnd3PlaceFightIfNeededKanku(title, fightDetails)


def cancelFightOlympic(title, fightOwnId, fightDetails):
    winnerId = fightDetails[0]
    looserId = fightDetails[9]
    nextDuel = fightDetails[2]
    categoryId = fightDetails[3]
    level = fightDetails[8]

    clearCategoryPlacesIfNeededOlympic(title, categoryId, level)
    if level < 8:
        cleanWinnerFromNextFights(title, categoryId = categoryId, winnerId = winnerId, nextDuel = nextDuel)
        cleanLooserFromNextFights(title, categoryId = categoryId, looserId = looserId, nextDuel = nextDuel)
        if level == 7:
            cleanWinnerFromNextFights(title, categoryId = categoryId, winnerId = winnerId, nextDuel = nextDuel - 1)
            cleanLooserFromNextFights(title, categoryId = categoryId, looserId = looserId, nextDuel = nextDuel - 1)
    # print('winner', winnerId, -1, level);
    # print('looser', looserId, -1, level);
    setDoneKata(title, winnerId, -1, level);
    setDoneKata(title, looserId, -1, level);
    decrementAthStat(title, winnerId)
    unmarkWinnerForFight(title, fightOwnId)


def cancelFightCircle(title, fightOwnId, fightDetails):
    winnerId = fightDetails[0]
    winner = 'aka' if fightDetails[5] == 1 else (
           'shiro' if fightDetails[6] == 1 else '' )
    categoryId = fightDetails[3]
    level = fightDetails[8]

    clearCategoryPlacesIfNeededCircle(title, categoryId, level)
    unmarkWinnerForFight(title, fightOwnId)
    points = getAndCleanupFightPoints(title, fightOwnId, winner)
    decrementAthStat(title, winnerId, points = points)



def cancelFightWkb(title, fightOwnId, fightDetails):
    winnerId = fightDetails[0]
    winner = 'aka' if fightDetails[5] == 1 else (
            'shiro' if fightDetails[6] == 1 else '' )

    unmarkWinnerForFight(title, fightOwnId)
    points = getAndCleanupFightPointsWkb(title, fightOwnId, winner)
    decrementAthStatWkb(title, winnerId, points)

    cleanAthFromNextLevelsIfNeededWkb(title, [fightOwnId])


def cancelFightWkbFinal(title, fightOwnId, fightDetails):
    categoryId = fightDetails[3]
    level = fightDetails[8]

    unmarkWinnerForFight(title, fightOwnId)
    # decrementAthStat(title, winnerId)
    # clearCategoryPlacesIfNeededOlympic(title, categoryId, level)
    clearCategoryPlacesIfNeededWKB(title, categoryId, level)


def cancelFightKanku(title, fightOwnId, fightDetails):
    if (isFinalOr3PlaceFight(fightDetails)):
        cancelFightOlympic(title, fightOwnId, fightDetails)
    else :
        cancelFightCircle(title, fightOwnId, fightDetails)
        clearAthFromFinalAnd3PlaceFightKanku(title, fightDetails[3])


# Third level of detalization ####################################

def promoteWinnerToNextFight(title, nextDuel, fightNumDuel, categoryId, duelsWithGivenNextDuel, winnerId):
    cursor = connection.cursor()
    winnerIsAkaInNextFight = duelsWithGivenNextDuel[0][0] == fightNumDuel
    # winnerIsShiroInNextFight = duelsWithGivenNextDuel[1][0] == fightNumDuel

    athColumn = 'AthIdRed' if winnerIsAkaInNextFight else 'AthIdWhite'

    # Переносим победителя пары в следующую пару. У нас в записи есть поле NextDuel.
    # Соответственно переносим индекс победителя (AthIdRed или AthIdWhite)
    # в поле AthIdRed или AthIdWhite для записи, у которой NumDuel равен NextDuel.
    # Т.е. находим запись с NumDuel равным NextDuel и заменяем в найденной записи
    # AthIdRed или AthIdWhite на AthIdRed или AthIdWhite из текущего поединка.

    where = f'WHERE NumDuel = {nextDuel} AND CategoryId = {categoryId}'
    query = (f'UPDATE {title}_champ ' +
            f'SET {athColumn} = {winnerId} ' +
            where)
    cursor.execute(query)

# nextDuelForLoosers = None
'''Promote loosers from 7 level to fight for the 3 place'''
def promoteLooserToNextFight(title, level, fightNumDuel, categoryId, duelsWithGivenNextDuel, looserId):
    # loosers can only be promoted from the 7-th level to fight for 3-d place

    if level == 7 :
        cursor = connection.cursor()

        winnerIsAkaInNextFight   = (duelsWithGivenNextDuel[0][1] == looserId) or (duelsWithGivenNextDuel[0][2] == looserId)
        winnerIsShiroInNextFight = (duelsWithGivenNextDuel[1][1] == looserId) or (duelsWithGivenNextDuel[1][2] == looserId)

        athColumn = 'AthIdRed' if winnerIsAkaInNextFight else 'AthIdWhite'

        where = f'WHERE level = 8 AND CategoryId = {categoryId}'
        query = (f'UPDATE {title}_champ ' +
                f'SET {athColumn} = {looserId} ' +
                where)

        cursor.execute(query)


# title, categoryId, winner, nextDuel
def cleanWinnerFromNextFights(title, tatami = None, time = None, categoryId = None, winnerId = None, nextDuel = None):
    cursor = connection.cursor()
    categories = getAllOlympicCategoriesIds(title, tatami = tatami, time = time) if categoryId == None else [str(categoryId)]
    # print("cleanWinnerFromNextFights")
    # print("categories", categories)

    for category in categories:
        winners = getCategoryWinners(title, category) if winnerId == None else [str(winnerId)]
        winners = ', '.join(winners)

        if winners == '':
          continue

        nextDuels = getNextDuels(title, category) if nextDuel == None else [str(nextDuel)]
        nextDuels = ', '.join(nextDuels)

        if nextDuels == '':
          continue

        autoPassedWinners = getAutoPassedWinners(title, category)
        autoPassedWinners = ', '.join(autoPassedWinners) if autoPassedWinners != None else ''
        autoPassedWinners = 0 if autoPassedWinners == '' else autoPassedWinners

        query = (f'UPDATE {title}_champ ' +
                  'SET AthIdRed = -1 ' +
                 f'WHERE ' +
                  f'CategoryId = {category} AND ' +
                  f'NumDuel IN ({nextDuels}) AND ' +
                  f'AthIdRed IN ({winners}) AND ' +
                  f'( (AthIdRed NOT IN ({autoPassedWinners})) AND LevePair >= 1 )'
        )
        # print(query)
        cursor.execute(query)

        query = (f'UPDATE {title}_champ ' +
                  'SET AthIdWhite = -1 ' +
                 f'WHERE ' +
                  f'CategoryId = {category} AND ' +
                  f'NumDuel IN ({nextDuels}) AND ' +
                  f'AthIdWhite IN ({winners}) AND ' +
                  f'( AthIdWhite NOT IN ({autoPassedWinners}) AND LevePair >= 1 )'
        )

        cursor.execute(query)
        


def cleanLooserFromNextFights(title, tatami = None, time = None, categoryId = None, looserId = None, nextDuel = None):
    cursor = connection.cursor()
    categories = getAllOlympicCategoriesIds(title, tatami = tatami, time = time) if categoryId == None else [str(categoryId)]

    for category in categories:
        # Ideally we need here only loosers of the level 7 if there is fight for 3 place
        # But this general case does its work too
        loosers = getCategoryLoosers(title, category) if looserId == None else [str(looserId)]
        loosers = ', '.join(loosers)

        if loosers == '':
          continue

        nextDuels = getNumDuelFor3Place(title, category)
        nextDuels = ', '.join(nextDuels)

        if nextDuels == '':
          continue

        query = (f'UPDATE {title}_champ ' +
                  'SET AthIdRed = -1 ' +
                 f'WHERE ' +
                  f'CategoryId = {category} AND ' +
                  f'NumDuel IN ({nextDuels}) AND ' +
                  f'AthIdRed IN ({loosers}) AND ' +
                  # f'( (AthIdRed NOT IN ({autoPassedWinners})) AND LevePair = 1 || LevePair > 1 )'
                  f'( LevePair >= 1 )'
        )

        cursor.execute(query)

        query = (f'UPDATE {title}_champ ' +
                  'SET AthIdWhite = -1 ' +
                 f'WHERE ' +
                  f'CategoryId = {category} AND ' +
                  f'NumDuel IN ({nextDuels}) AND ' +
                  f'AthIdWhite IN ({loosers}) AND ' +
                  # f'( AthIdWhite NOT IN ({autoPassedWinners}) AND LevePair = 1 || LevePair > 1 )'
                  f'( LevePair >= 1 )'
        )

        cursor.execute(query)


def promoteAthForNextLevelIfNeededWkb(champName, fightDetails):
    fightsLeftInCurrentLevel = filterFights(champName, tatami = fightDetails[4], category = fightDetails[3], time = fightDetails[7], level = fightDetails[8], skipNumDuelOForWkbDraw = True, countOnly = True)
    # print(fightsLeftInCurrentLevel)
    if fightsLeftInCurrentLevel == 0:
        selectAthForNextLevelWkb(champName, fightDetails)



def selectAthForNextLevelWkb(champName, fightDetails):
    nextLevel = getNextWkbLevel(level = fightDetails[8])

    result = 0
    # print(nextLevel)
    if (nextLevel == 7):
        # second circle
        result = selectAthForSemifinalWkb(champName, fightDetails)
    elif (nextLevel == 8 ): # or nextLevel == 12
        result = selectAthForLastLevelWkb(champName, fightDetails)
    else:
        pass

    return result



def selectAthForSemifinalWkb(champName, fightDetails) :
    cursor = connection.cursor()
    result = 0
    nextLevel = 7

    passedFightsOfCurrentLevel = filterFights(champName, tatami = fightDetails[4], category = fightDetails[3], time = fightDetails[7], level = fightDetails[8], futureFightsOnly = False, skipNumDuelOForWkbDraw = True, skipWkbDesqualified = True)
    fightsOfNextLevelToFill = filterFights(champName, tatami = fightDetails[4], category = fightDetails[3], time = fightDetails[7], level = nextLevel, skipNumDuelOForWkbDraw = True, futureFightsOnly = False) #, log = True

    passedLevelLength = len(passedFightsOfCurrentLevel)
    nextLevelLength = len(fightsOfNextLevelToFill)

    shift = passedLevelLength - nextLevelLength
    shift = shift if shift > 0 else 0
    passedFightsOfCurrentLevel = passedFightsOfCurrentLevel[shift:]

    for i in range(nextLevelLength):
        duelIsPlace = i >= passedLevelLength
        athleteId = passedFightsOfCurrentLevel[i]["AthIdRed"] if not duelIsPlace else -1
        fightsOfNextLevelToFill[i]["AthIdRed"] = athleteId

        query = ( f'UPDATE {champName}_champ ' +
                f'SET AthIdRed = {athleteId}, AthIdWhite = -1, DuelIsPlace = {duelIsPlace}, Refery1 = 0, Refery2 = 0, Refery3 = 0, Refery4 = 0, Refery5 = 0, Avg = 0 ' +
                f'WHERE {champName}_champ.ownId = {fightsOfNextLevelToFill[i]["ownId"]}')

        cursor.execute(query)

        fedched = cursor.fetchall()
        fedched = fedched[0] if len(fedched) > 0 else 0
        result = result + fedched

    # updated {result} rows

    return result


def selectAthForLastLevelWkb(champName, fightDetails):
    result = 0
    category = fightDetails[3]
    # print(category)
    levelCircleCategory = defineCategory(champName, category);
    isKANCategory = (int(levelCircleCategory) == 4 or int(levelCircleCategory) == 5)

    # 1. Выбираем всех участников второго круга, у которых значение поля Avg больше 1 (не дисквалифицированы), и значения поля TotalBal из таблицы *_athchamp для каждой записи.
    # print('selectAthForLastLevelWkb=')
    passedFightsOfCurrentLevel = filterFights(champName, tatami = fightDetails[4], category = category, time = fightDetails[7], level = fightDetails[8], futureFightsOnly = False, skipNumDuelOForWkbDraw = True, skipWkbDesqualified = True)
    # print('selectAthForLastLevelWkb=', len(passedFightsOfCurrentLevel))
    
    if (len(passedFightsOfCurrentLevel) >= 2):
        result += setAthFinalOr3PlaceFight(champName, category, passedFightsOfCurrentLevel[1]["AthIdRed"], passedFightsOfCurrentLevel[0]["AthIdRed"])

    if(isKANCategory):
        if (len(passedFightsOfCurrentLevel) >= 3):
            fillInCategoryPlace(champName, category, 3, passedFightsOfCurrentLevel[2]["AthIdRed"])
        if (len(passedFightsOfCurrentLevel) >= 4):
            fillInCategoryPlace(champName, category, 4, passedFightsOfCurrentLevel[3]["AthIdRed"])
        return result

    #TOTHINK
    # Maybe this is ambvivalent place to place the code that writes winners.
    # As all winners are written in fillInCategoryPlaces, but not here.
    if (len(passedFightsOfCurrentLevel) == 3):
        # If amount of participants of prelast level is 3 -
        # the first two participants go to final fight (see 2 lines above)
        # and the third goes directly to third place winner position (and has no fights anymore)
        fillInCategoryPlace(champName, category, 3, passedFightsOfCurrentLevel[2]["AthIdRed"])

    if (len(passedFightsOfCurrentLevel) >= 4):
        result += setAthFinalOr3PlaceFight(champName, category, passedFightsOfCurrentLevel[3]["AthIdRed"], passedFightsOfCurrentLevel[2]["AthIdRed"], isFinal = False)

    return result

def cleanAthFromNextLevelsIfNeededWkb(champName, fightOwnIds):
    result = 0
    levels = getFightsLevels(champName, fightOwnIds)

    # TODO: check if clearence is needed?
    for level in levels:
        result = result + getNextLevelAndClearAthWkb(champName, levelAndCategory = level)

    return result


def getNextLevelAndClearAthWkb(champName, levelAndCategory = [-1,-1]):
    result = 0
    nextLevel = getNextWkbLevel(levelAndCategory[0])

    if (nextLevel != -1):
        result = result + clearAthFromLevel(champName, level = nextLevel, categoryId = levelAndCategory[1])

    if (nextLevel == 8):
        result = result + clearAthFromLevel(champName, level = 12, categoryId = levelAndCategory[1])

    return result



def clearAthFromLevel(champName, tatami = None, time = None, level = None, categoryId = None, allLevelsExceptMin = False) :
    cursor = connection.cursor()

    whereClause = ''

    if (allLevelsExceptMin):
        #   query = (f'SELECT MIN(Level) ' +
        #         f'FROM {title}_champ JOIN {title}_category ON {title}_champ.categoryId = {title}_category.categoryId ' +
        #         f'WHERE CategoryType = 2')

        # cursor.execute(query)

        # minLevel = cursor.fetchall()[0][0]
        categoryId = getAllWkbCategoriesIds(champName, tatami = tatami, time = time) if categoryId == None else [categoryId]
        categoryId = ' ,'.join(categoryId)
        categoryFilter = f'CategoryId IN ({categoryId})' if categoryId != '' else 'FALSE'

        whereClause = f'WHERE Level > 6 AND {categoryFilter} '
    else:
        if (level != None) :
            whereClause = f'WHERE Level = {level} AND CategoryId = {categoryId} '

    query = (
        f'UPDATE {champName}_champ ' +
        f'SET AthIdWhite = -1, AthIdRed = -1 ' +
        f'{whereClause}'
    )

    # print("clearAthFromLevel")
    # print("query", query)

    executed = cursor.execute(query)
    fetched = cursor.fetchall()

    return fetched[0] if len(fetched) else 0


def clearAthFromFinalAnd3PlaceFight(title, tatami = None, time = None, categoryId = None) :
    categoryIds = getAllKankuCategoriesIds(title, tatami = tatami, time = time) if categoryId == None else [categoryId]

    # TODO: optimize - do it with one sql query
    for id in categoryIds:
      clearAthFromFinalAnd3PlaceFightKanku(title, id)



def promoteAthForFinalAnd3PlaceFightIfNeededKanku(champName, fightDetails):
    fightsLeftInCurrentLevel = filterFights(champName, tatami = fightDetails[4], category = fightDetails[3], time = fightDetails[7], level = fightDetails[8], countOnly = True)

    if fightsLeftInCurrentLevel == 0:
        selectAthForFinalAnd3PlaceFightKanku(champName, fightDetails)


def clearAthFromFinalAnd3PlaceFightKanku(title, categoryId):
    setAthFinalOr3PlaceFight(title, categoryId, -1, -1, isFinal = True)
    setAthFinalOr3PlaceFight(title, categoryId, -1, -1, isFinal = False)