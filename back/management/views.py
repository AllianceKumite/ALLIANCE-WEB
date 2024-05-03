#! Toutnament Management views
"""
Business logic is in - controllers.py
Helpful trivial functions with no special complex logic - helpers.py

"""
# doc, core, utils, data, examples, test

import csv
# import pdfkit
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
from django.http import HttpResponse, JsonResponse
from rest_framework.parsers import JSONParser
from io import TextIOWrapper
from registration.views import *
from registration.serializers import *
from .helpers import *
from fight.helpers import *
from management.controller import *
from apiPost.views import *


# arrTimer = ['none', 10, 20, 30, 40, 50, 60, 70, 80, 0, 0, 0, 12]
arrDuelTatami = [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
arrTimer = []
# TODO: use request.data
#   https://www.django-rest-framework.org/api-guide/requests/

# TODO: Check, test
@csrf_exempt
def GetOnlineTatamiTimer(request):
    if request.method == 'POST':
        json_string = JSONParser().parse(request)

        # tatami = json_string.get('tatami')
        namechamp = json_string.get('name')

        if (namechamp is None):
            return HttpResponse(status=400)
        idx = getTimerTournament(namechamp, False)
        if (idx < 0):
            return HttpResponse(status=400)

        # time = 0
        # if tatami >=1 & tatami <= 12:
        item = arrTimer[idx]
            # time = item[tatami]
        # print(time)
        return JsonResponse(item, safe=False, status=200)
        # except:
        #     return HttpResponse(status=400)

    return HttpResponse(status=200)

@csrf_exempt
def GetOnlineTatamiFightNumber(request):
    if request.method == 'POST':
        # json_string = JSONParser().parse(request)

        # tatamiId = json_string.get('tatami')
        # if (tatamiId is None):
        #     return HttpResponse(status=400)

        # item = arrDuelTatami[tatamiId - 1]

        return JsonResponse(arrDuelTatami, safe=False, status=200)
        # except:
        #     return HttpResponse(status=400)

    return HttpResponse(status=200)

@csrf_exempt
def SetOnlineTatamiTimer(request):
    if request.method == 'POST':
        json_string = JSONParser().parse(request)
        # print(json_string)

        tatami = json_string.get('tatami')
        time = json_string.get('time')
        namechamp = json_string.get('name')

        if (tatami is None or namechamp is None):
            return HttpResponse(status=400)
        global arrTimer
        idx = getTimerTournament(namechamp, True)
        item = arrTimer[idx]
        if tatami >=1 & tatami <= 12:
            item[tatami] = time
        # print(item)
        # print(arrTimer)
        return HttpResponse(status=200)

    return HttpResponse(status=200)

def getTimerTournament(name, add : bool):
    result = []
    idx = -1
    for i in range(len(arrTimer)):
        item = arrTimer[i]
        if item[0] == name: 
            result = item
    for item in arrTimer:
        if item[0] == name: 
            idx = i
            break
    if idx < 0:
        # print('append')
        arrTimer.append([name, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
        idx = len(arrTimer) - 1
    return idx

@csrf_exempt
def setSubtimes(request):
    if request.method == 'POST':
        title = request.POST.get('Title')
        file = request.FILES.get('file')
        if title is None or file is None:
            HttpResponse(status=400)
        try:
            title = title.replace(" ", "_")
            cursor = connection.cursor()
            cursor.execute('TRUNCATE TABLE ' + title + '_subtime')
            f = TextIOWrapper(file, encoding="utf-8")
            reader = csv.reader(f)
            for line in reader:
                if len(line) > 0:
                    # ????
                    x = line[0].replace('"', "`")
                    x = x if x.isdigit() else '"' + x + '"'
                    # arr_of_values = line[0].split(';')
                    # arr_of_values = [x.replace('"', "`") for x in arr_of_values]
                    # arr_of_sql_values = [x if x.isdigit() else '"' + x + '"' for x in arr_of_values]
                    cursor.execute('INSERT INTO ' + title + '_subtime ' +
                        'VALUES ( null, ' + ', ' + x + ' )'
                    )
        except:
            return HttpResponse(status=400)

    return HttpResponse(status=201)


# @csrf_exempt
# def createPdfFile(request):
#      print(request)
#      options = {
#         'page-size': 'A4',
#         'margin-top': '0.75in',
#         'margin-right': '0.75in',
#         'margin-bottom': '0.75in',
#         'margin-left': '0.75in',
#     }
#      print("="*50)
#      config = pdfkit.configuration(wkhtmltopdf='C:\Program Files\wkhtmltopdf')
#      pdfkit.from_string("<p><b>Python</b> is a great programming language.</p>", "string.pdf", configuration=config, verbose=True)
#      print("="*50)
#      return HttpResponse(status=200)
   
@csrf_exempt
def getSubtimes(request):
    if request.method == 'POST':
        json_string = JSONParser().parse(request)
        title = json_string.get('title')

        if title is None:
            return HttpResponse('Insuficient data', status=400)

        try:
            title = title.replace(" ", "_")
            times = getAllTimes(title)

            return JsonResponse(times, status=200, safe=False)
        except Exception as e:
            return HttpResponse(getPrintableInfo(e), status=400)

    return HttpResponse(status=201)

@csrf_exempt
def getAllKata(request):
    if request.method == 'POST':
        json_string = JSONParser().parse(request)
        title = json_string.get('title')

        if title is None:
            return HttpResponse('Insuficient data', status=400)

        try:
            title = title.replace(" ", "_")
            katas = getKata(title)

            return JsonResponse(katas, status=200, safe=False)
        except Exception as e:
            return HttpResponse(getPrintableInfo(e), status=400)

    return HttpResponse(status=201)

@csrf_exempt
def getAllLevelKata(request):
    if request.method == 'POST':
        json_string = JSONParser().parse(request)
        title = json_string.get('title')

        if title is None:
            return HttpResponse('Insuficient data', status=400)

        try:
            title = title.replace(" ", "_")
            levels = getLevelKata(title)

            return JsonResponse(levels, status=200, safe=False)
        except Exception as e:
            return HttpResponse(getPrintableInfo(e), status=400)

    return HttpResponse(status=201)

@csrf_exempt
def getСategoryForTimeAndTatami(request):
    if request.method == 'POST':
        json_string = JSONParser().parse(request)
        title = json_string.get('title')
        tatami = json_string.get('tatami')
        time = json_string.get('time')
        saveTime = json_string.get('saveTime')

        if title is None:
            return  HttpResponse(status=400)

        try:
          title = title.replace(" ", "_").lower()
          # saveTime
          if (saveTime) :
              setTournamentTime(title, tatami, time)
          categories = filterCategories(title, tatami, time)

          return JsonResponse(categories, status=200, safe=False)

        except Exception as e:
          return HttpResponse(getPrintableInfo(e), status=400)

    return HttpResponse(status=201)


@csrf_exempt
def getFightsToManageRequest(request):
    if request.method == 'POST':
        json_string = JSONParser().parse(request)

        title = json_string.get('title')
        tatami = json_string.get('tatami')
        time = json_string.get('time')
        category = json_string.get('category')

        # or (tatami is None)
        if (title is None) :
            return HttpResponse('Insuficient data', status=400)

        title = title.replace(" ", "_")

        try:
            fights = getFightsToManageWithParticipants(title, tatami = tatami, category = category, time = time)

            return JsonResponse(fights, safe=False, status=200)
        except Exception as e:
            return HttpResponse(getPrintableInfo(e), status=400)

    return HttpResponse(status=200)


@csrf_exempt
def setFightWinnerRequest(request):
    if request.method == 'POST':
        json_string = JSONParser().parse(request)

        title = json_string.get('title')
        fightOwnId = json_string.get('fight')
        winner = json_string.get('winner')
        points = json_string.get('points')
        categoryFilter = json_string.get('categoryFilter')
        kataidAka = json_string.get('kataIdAka')
        kataidShiro = json_string.get('kataIdShiro')
        level = json_string.get('level')

        # print('kataidAka=', kataidAka)
        # print('kataidShiro=', kataidShiro)
        # print('level=', level)

        if title is None or fightOwnId is None or winner is None:
            HttpResponse('Insuficient data', status=400)

        try:
            title = title.replace(" ", "_")

            fightDetails = getFightDetails(title, fightOwnId, winner = winner)
            tatamiId = fightDetails[4];

            setFightWinner(title, fightOwnId, winner = winner, points = points, fightDetails = fightDetails, kataidAka = kataidAka, kataidShiro = kataidShiro, level = level)
            nextFight = getCurrentFightForTatamisTimeAndCategory(title, tatami = fightDetails[4], time = fightDetails[7], category = categoryFilter)

            # print('tatamiId=', tatamiId, 'numDuel=', nextFight['details']['NumDuel']);
            if(nextFight):
                arrDuelTatami[tatamiId - 1] = nextFight['details']['NumDuel'];
            else:
                arrDuelTatami[tatamiId - 1] = -1;
            # print(arrDuelTatami)

            return JsonResponse(nextFight, status=200, safe = False)
        except Exception as e:
            return HttpResponse(getPrintableInfo(e), status=400)

    return HttpResponse(status=201)


# TODO:Split By Category types ??
@csrf_exempt
def cancelFightsRequest(request):
    if request.method == 'POST':
        json_string = JSONParser().parse(request)

        title = json_string.get('title')

        if title is None:
            return HttpResponse('Insuficient data', status=400)

        title = title.replace(" ", "_")
        fightOwnIds = json_string.get('fight')
        categoryFilter = json_string.get('categoryFilter')
        time = json_string.get('time')
        tatami = json_string.get('tatami')

        try:
            notCanceled = calcelAllFights(title, tatami, time) if fightOwnIds == -1 else cancelFightsByIds(title, fightOwnIds)
            nextFight = getCurrentFightForTatamisTimeAndCategory(title, tatami = tatami, time = time, category = categoryFilter )
            # 'nextFight': getCurrentFightForTatamisTimeAndCategory(title, tatami = fightDetails[4], time = fightDetails[7], category = categoryFilter),

            if(nextFight):
                arrDuelTatami[tatami - 1] = nextFight['details']['NumDuel'];
            else:
                arrDuelTatami[tatami - 1] = -1;

            result = {
                'nextFight': nextFight,
                'notCanceled': notCanceled
            }

            return JsonResponse(result, status = 200)
        except Exception as e:
            return HttpResponse(getPrintableInfo(e), status=400)

    return HttpResponse(status=201)


@csrf_exempt
def postponeFightsRequest(request):
    return postponeOrUnpostponeFightsRequests(request, True)


@csrf_exempt
def unpostponeFightsRequest(request):
    return postponeOrUnpostponeFightsRequests(request, False)


def postponeOrUnpostponeFightsRequests(request, postpone):
    if request.method == 'POST':
        json_string = JSONParser().parse(request)

        title = json_string.get('title')
        fightOwnIds = json_string.get('fight')
        categoryId = json_string.get('category')
        categoryFilter = json_string.get('categoryFilter')

        # fightsIds = fightOwnId.split(',')

        if title is None:
            return HttpResponse('Insuficient data', status=400)

        title = title.replace(" ", "_")

        try:
            activeTatami = json_string.get('tatami')
            time = json_string.get('time')

            postponed = postponeOrUnpostponeFights(title, fightOwnIds, postpone, activeTatami = activeTatami, categoryId = categoryId, time = time)
            nextFight = getCurrentFightForTatamisTimeAndCategory(title, tatami = postponed["tatami"], time = postponed["time"], category = categoryFilter)

            # HttpResponse('Insuficient data (activeTatami missing)', status=400)

            result = {
              'nextFight': nextFight,
              'notCanceled': []
            }

            return JsonResponse(result, status = 200)
        except Exception as e:
            return HttpResponse(getPrintableInfo(e), status=400)

    return HttpResponse(status=201)


@csrf_exempt
def updateSwitchersRequest(request):
    if request.method == 'POST':
        json_string = JSONParser().parse(request)

        title = json_string.get('title')
        fight = json_string.get('fight')
        akaShiro = json_string.get('akaShiro') # R | W
        switchers = json_string.get('switchers')
        # fightsIds = fightOwnId.split(',')

        if title is None:
            return HttpResponse('Insuficient data', status=400)

        if (akaShiro != "R" and akaShiro != "W") :
            return HttpResponse('Unsupported akaShiro type', status=400)

        if (len(switchers) != 6) :
            return HttpResponse('Unsupported switchers values', status=400)

        title = title.replace(" ", "_")

        try:
            modified = updateSwitchers(title, fight, akaShiro, switchers)

            return JsonResponse({"modified": modified}, status = 200)
        except Exception as e:
            return HttpResponse(getPrintableInfo(e), status=400)

    return HttpResponse(status=201)
