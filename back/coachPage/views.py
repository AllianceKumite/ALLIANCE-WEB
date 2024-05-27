import json
import re
from datetime import datetime

from django.contrib.auth.hashers import make_password
from rest_framework.parsers import JSONParser
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from registration.serializers import *
from django.db import connection
import base64
from rest_framework.decorators import api_view
from rest_framework.decorators import parser_classes
from rest_framework.parsers import JSONParser
from django.conf import settings
from django.contrib.auth.models import User

@csrf_exempt
def GetFileLogo(request):
    result = ''
    if request.method == 'POST':
        json_string = JSONParser().parse(request)
        file_name = json_string.get('name')
        file_name = settings.FRONT_APP_LOCATION + "assets/media/logos/" + file_name
        os.path.isfile(file_name)
    return result


@csrf_exempt
def GetCoachAth(request):
    if request.method == 'POST':
        try:
            json_string = JSONParser().parse(request)

            coach_id = json_string.get('coachId')
            club_id = json_string.get('clubId')
            title = json_string.get('title')
            filters = json_string.get('filters')
            isSuperAdmin = json_string.get('isSuperAdmin')

            if title is None or filters is None or isSuperAdmin is None:
                HttpResponse(status=400)

            # AND_FIND_BY_NAME = f' AND FIO LIKE "%{filters["findByName"]}%" ' if filters['findByName'] != '' else ' '
            # AND_FIND_BY_NAME_LOCAl = f' AND {title}_athchamp.FIO LIKE "%{filters["findByName"]}%" ' if filters['findByName'] != '' else ' '


            cursor = connection.cursor()
            dateFrom = ''
            try:
                query = 'SELECT champFrom FROM champs WHERE title like ' + f'"{title}"';
                cursor.execute(query)
                dateFrom = cursor.fetchall()[0][0];
            except:
                pass


            SELECT_GLOBAL_SIMPLE = (
                            'SELECT athId, FIO, Photo, dateBR, Age, gender, DAN, Weight, Participant, Kumite, Kata, KataGroup, Favorit1, Favorit2, Division, teamcompetition ' +
                            f'FROM athonline ')
            SELECT_LOCAL_SIMPLE = (
                            f'SELECT {title}_athchamp.athId, {title}_athchamp.FIO, {title}_athchamp.Photo, {title}_athchamp.dateBR, {title}_athchamp.Age, {title}_athchamp.gender, {title}_athchamp.DAN, {title}_athchamp.Weight, {title}_athchamp.Kumite, {title}_athchamp.Kata, {title}_athchamp.KataGroup, {title}_athchamp.Favorit1, {title}_athchamp.Favorit2, {title}_athchamp.CoachId, {title}_athchamp.Division, {title}_athchamp.teamcompetition, Participant ' +
                            f'FROM {title}_athchamp ' +
                            f'JOIN athonline ON {title}_athchamp.athId = athonline.athId ')
            SELECT_GLOBAL = (
                            f'SELECT athId, FIO, Photo, dateBR, Age, gender, DAN, Weight, Participant, Kumite, Kata, KataGroup, Favorit1, Favorit2, Division, teamcompetition, clubs.clubName, coaches.coachName ' +
                            f'FROM athonline ' +
                            f'LEFT JOIN clubs ON clubs.clubId = athonline.ClubId ' +
                            f'LEFT JOIN coaches ON coaches.coachId = athonline.CoachId ')
            SELECT_LOCAL = (
                            f'SELECT {title}_athchamp.athId, {title}_athchamp.FIO, {title}_athchamp.Photo, {title}_athchamp.dateBR, {title}_athchamp.Age, {title}_athchamp.gender, {title}_athchamp.DAN, {title}_athchamp.Weight, {title}_athchamp.Kumite, {title}_athchamp.Kata, {title}_athchamp.KataGroup, {title}_athchamp.Favorit1, {title}_athchamp.Favorit2, {title}_athchamp.CoachId, {title}_athchamp.Division, {title}_athchamp.teamcompetition, Participant, clubs.clubName, coaches.coachName ' +
                            f'FROM {title}_athchamp ' +
                            f'JOIN athonline ON {title}_athchamp.athId = athonline.athId ' +
                            f'LEFT JOIN clubs ON clubs.clubId = {title}_athchamp.ClubId ' +
                            f'LEFT JOIN coaches ON coaches.coachId = {title}_athchamp.CoachId ')

            # WHERE_PARTICIPANTS     = 'Participant = 1 ' if filters['participantOption'] == 'onlyParticipants ' else ' '
            # WHERE_PARTICIPANTS_AND = 'Participant = 1 AND ' if filters['participantOption'] == 'onlyParticipants ' else ' '

            AND_WHERE_CLUB = (f'AND athonline.ClubId = {club_id} ORDER BY FIO ' if club_id is not None else ' ORDER BY FIO ')
            AND_WHERE_CLUB_LOCAL = (f' AND {title}_athchamp.ClubId = {club_id} ORDER BY {title}_athchamp.FIO ' if club_id is not None else f' ORDER BY {title}_athchamp.FIO ')

            WHERE_GENDER_GLOBAL = 'gender = "Ч(M)" ' if filters['genderOption'] == 'man' else 'gender = "Ж(F)" '
            WHERE_GENDER_LOCAL = f'{title}_athchamp.gender = "Ч(M)" ' if filters['genderOption'] == 'man' else f'{title}_athchamp.gender = "Ж(F)" '

            # print('===================================')

            if isSuperAdmin:
                if filters['genderOption'] == 'all':
                    if coach_id is None:
                        query = (SELECT_GLOBAL +
                            'WHERE 1 ' +
                            # WHERE_PARTICIPANTS +
                            # AND_FIND_BY_NAME +
                            AND_WHERE_CLUB)

                        cursor.execute(query)
                    else:
                        query = (SELECT_GLOBAL +
                            'WHERE ' +
                            # WHERE_PARTICIPANTS_AND +
                            f'athonline.coachId = {coach_id} ' +
                            # AND_FIND_BY_NAME +
                            AND_WHERE_CLUB)

                        # print("11 +")
                        # print(query)
                        cursor.execute(query)
                else:
                    if coach_id is None:
                        query = (SELECT_GLOBAL +
                            'WHERE ' +
                            # WHERE_PARTICIPANTS_AND +
                            WHERE_GENDER_GLOBAL +
                            # AND_FIND_BY_NAME +
                            AND_WHERE_CLUB)

                        # print("10 +")
                        # print(query)
                        cursor.execute(query)
                    else:
                        query = (SELECT_GLOBAL +
                            'WHERE ' +
                            # WHERE_PARTICIPANTS_AND +
                            WHERE_GENDER_GLOBAL +
                            f'AND athonline.coachId = {coach_id} ' +
                            # AND_FIND_BY_NAME +
                            AND_WHERE_CLUB)

                        # print("9 + ")
                        # print(query)
                        cursor.execute(query)

                # print('Select is Ok')
                not_participants_ath = fetch_all(cursor, dateFrom)
                total_not_participants = len(not_participants_ath)

                participants_ath = []
                total_participant = 0

                if title is not None and title != '':
                    if filters['genderOption'] == 'all':
                        if coach_id is None:
                            query = (SELECT_LOCAL +
                                f'WHERE 1 ' +
                                # AND_FIND_BY_NAME_LOCAl +
                                AND_WHERE_CLUB_LOCAL)
                            # print("8 +")
                            # print(query)
                            cursor.execute(query)
                        else:
                            query = (SELECT_LOCAL +
                                f'WHERE {title}_athchamp.CoachId = {coach_id} ' +
                                # AND_FIND_BY_NAME_LOCAl +
                                AND_WHERE_CLUB_LOCAL)
                            # print("7")
                            # print(query)
                            cursor.execute(query)
                    else:
                        if coach_id is None:
                            query = (SELECT_LOCAL +
                                ' WHERE ' +
                                # WHERE_PARTICIPANTS_AND +
                                WHERE_GENDER_LOCAL +
                                # AND_FIND_BY_NAME_LOCAl +
                                AND_WHERE_CLUB_LOCAL)
                            # print("6 + ")
                            # print(query)
                            cursor.execute(query)
                        else:
                            query = (SELECT_LOCAL +
                                f'WHERE ' +
                                WHERE_GENDER_LOCAL +
                                f'AND {title}_athchamp.CoachId = {coach_id} ' +
                                # AND_FIND_BY_NAME_LOCAl +
                                AND_WHERE_CLUB_LOCAL)
                            # print("5")
                            # print(query)
                            cursor.execute(query)

                    participants_ath = fetch_all(cursor, dateFrom)
                    total_participant = len(participants_ath)

                athletes = {
                    'participants': participants_ath,
                    'not_participants': not_participants_ath,
                    'total_not_participants': total_not_participants,
                    'total_participant': total_participant
                }

                return JsonResponse(athletes, status=200)
            else:
                if filters['genderOption'] == 'all':
                    query = (SELECT_GLOBAL_SIMPLE +
                        'WHERE ' +
                        # WHERE_PARTICIPANTS_AND +
                        f'coachId = {coach_id} ' +
                        # AND_FIND_BY_NAME +
                        f'ORDER BY FIO asc')

                    # print("4 +")
                    # print(query)
                    cursor.execute(query)
                else:
                    query = (SELECT_GLOBAL_SIMPLE +
                        'WHERE ' +
                        # WHERE_PARTICIPANTS_AND +
                        WHERE_GENDER_GLOBAL +
                        f'AND coachId = {coach_id} ' +
                        # AND_FIND_BY_NAME +
                        f'ORDER BY FIO asc')

                    # print("3 +")
                    # print(query)
                    cursor.execute(query)

                not_participants_ath = fetch_all(cursor, dateFrom)
                total_not_participants = len(not_participants_ath)
                participants_ath = []
                total_participant = 0

                if title is not None and title != '':
                    if filters['genderOption'] == 'all':
                        query = (SELECT_LOCAL_SIMPLE +
                                f' WHERE ' +
                                f'{title}_athchamp.CoachId = {coach_id} ' +
                                # AND_FIND_BY_NAME_LOCAl +
                                f'ORDER BY {title}_athchamp.FIO asc')

                        # print("2 +")
                        # print(query)
                        cursor.execute(query)
                    else:
                        query = (SELECT_LOCAL_SIMPLE +
                            f'WHERE ' +
                            WHERE_GENDER_LOCAL +
                            f'AND {title}_athchamp.CoachId = {coach_id} ' +
                            # AND_FIND_BY_NAME_LOCAl +
                            f'ORDER BY {title}_athchamp.FIO asc')

                        # print("1 +")
                        # print(query)
                        cursor.execute(query)

                    participants_ath = fetch_all(cursor, dateFrom)
                    total_participant = len(participants_ath)

                athletes = {
                    'participants': participants_ath,
                    'not_participants': not_participants_ath,
                    'total_not_participants': total_not_participants,
                    'total_participant': total_participant
                }
                return JsonResponse(athletes, status=200)
        except Exception as e:
            # print(e)
            return HttpResponse(status=400)

@csrf_exempt
def GetAthInfo(request):
    if request.method == 'POST':
        try:
            json_string = JSONParser().parse(request)

            fio = json_string.get('fio')
            date = json_string.get('date')
            if fio is None or date is None:
                HttpResponse(status=400)

            cursor = connection.cursor()
            # TODO do not use athletes (?)
            cursor.execute('SELECT * FROM athletes WHERE fio = "' + fio + '" AND dateBR = "' + date + '"')
            data_to_return = dict_fetch_all(cursor)
        except:
            return HttpResponse(status=400)

    return JsonResponse(data_to_return, status=200)


@csrf_exempt
def DeleteAthFromChamp(request):
    if request.method == 'POST':
        # try:
        json_string = JSONParser().parse(request)
        athIds = json_string.get('athIds')
        title = json_string.get('title')

        if all(i is None for i in [athIds, title]):
            return HttpResponse(status=400)

        athIds = [str(athId) for athId in athIds]
        athIds = ' or athId = '.join(athIds)

        cursor = connection.cursor()
        cursor.execute(f'DELETE FROM {title}_athchamp WHERE athId = {athIds}')
        cursor.execute(f'UPDATE athonline SET Participant = 0 WHERE athId = {athIds}')
        # except:
        #     return HttpResponse(status=400)
        return HttpResponse(status=200)


@csrf_exempt
def ClearListAth(request):
    if request.method == 'POST':
        try:
            json_string = JSONParser().parse(request)
            title = json_string.get('title')
            coachId = json_string.get('coachId')
            if title is None and coachId is None:
                HttpResponse(status=400)

            title = title.replace(" ", "_")
            cursor = connection.cursor()
            cursor.execute(f'UPDATE athonline JOIN {title}_athchamp ON athonline.athId = {title}_athchamp.athId SET Participant = 0 WHERE athonline.CoachId = {coachId}')
            # print('asdada 2')
            cursor.execute(f'DELETE FROM {title}_athchamp WHERE CoachId = {coachId}')
        except Exception as e:
            # print(e)
            return HttpResponse(e, status=400)

    return HttpResponse(status=200)


@csrf_exempt
def DeleteAth(request):
    if request.method == 'POST':
        json_string = JSONParser().parse(request)
        try:
            title = json_string.get('title')
            athIds = json_string.get('athIds')

            if all(i is None for i in [athIds]):
                HttpResponse(status=400)

            athIds = [str(athId) for athId in athIds]
            athIds = ' or athId = '.join(athIds)

            query = f'DELETE FROM athonline WHERE athId = {athIds}'
            cursor = connection.cursor()
            cursor.execute(query)

            if title is not None and title != '':
                title = title.replace(" ", "_")
                cursor.execute(f'DELETE FROM {title}_athchamp WHERE athId = {athIds}')

        except Exception as e:
            HttpResponse(status=400)

        return HttpResponse(status=200)

@csrf_exempt
def DeleteRefery(request):
    if request.method == 'POST':
        json_string = JSONParser().parse(request)
        try:
            title = json_string.get('title')
            referyId = json_string.get('referyId')

            if referyId is None:
                HttpResponse(status=400)

            cursor = connection.cursor()

            if title is not None and title != '':
                title = title.replace(" ", "_")
                cursor.execute(f'DELETE FROM {title}_refery WHERE ReferyId = {referyId}')

        except Exception as e:
            HttpResponse(status=400)

        return HttpResponse(status=200)

import random
import string

def randomString(length): # define the function and pass the length as argument
    # Print the string in Lowercase
    return ''.join((random.choice(string.ascii_lowercase) for x in range(length)))

def checkIfAthleteExists(fio, br, athIdExpectedToBeFound):
    # print("******************")
    # print("checkIfAthleteExists")
    # print(fio, br, athIdExpectedToBeFound)

    cursor = connection.cursor()
    # query = f"SELECT athId FROM athonline WHERE FIO = '{fio}' and DateBR = '{br}'"
    # Use this way of formatting to avoid aphostrofe error
    query = "SELECT athId FROM athonline WHERE FIO = %s and DateBR = %s"
    cursor.execute(query, (fio, br))
    res = fetch_all(cursor)

    existingAthId = res[0]['athId'] if len(res) > 0 else None

    # print("existingAthId", existingAthId)
    # print("athIdExpectedToBeFound", athIdExpectedToBeFound)

    # If existingAthId difers from what is expected to be found
    # then take that other athlete alrready exists with the same fio and date
    exists = existingAthId != None and (
            # Athlete Editing
            athIdExpectedToBeFound != None and existingAthId != athIdExpectedToBeFound  or
            # New Athlete Creation
            athIdExpectedToBeFound == None)

    # print("exists", exists)

    return exists

def checkIfReferyExists(fio, title, referyIdExpectedToBeFound):
    # print("******************")
    cursor = connection.cursor()
    # query = f"SELECT athId FROM athonline WHERE FIO = '{fio}' and DateBR = '{br}'"
    # Use this way of formatting to avoid aphostrofe error
    query = "SELECT ReferyId FROM " + title + "_refery WHERE FIO = %s"
    cursor.execute(query, (fio))
    res = fetch_all(cursor)

    existingReferyId = res[0]['ReferyId'] if len(res) > 0 else None
    # print('existingReferyId', existingReferyId)
    # print('referyIdExpectedToBeFound', referyIdExpectedToBeFound)

    # If existingReferyId difers from what is expected to be found
    # then take that other refery alrready exists with the same fio

    # exists =  int(existingReferyId) != int(referyIdExpectedToBeFound)
    # print("exists", exists)

    exists = existingReferyId != None and (
            # Refery Editing
            referyIdExpectedToBeFound != None and int(existingReferyId) != int(referyIdExpectedToBeFound)  or
            # New Refery Creation
            referyIdExpectedToBeFound == None)

    # print("exists", exists)

    return exists

def normalizeFio(fio):
    fio = re.sub(r'[^\w\d\s\']+', '', fio)
    fio = ' '.join(fioPart.lower().capitalize() for fioPart in fio.split())

    return fio


@csrf_exempt
def InsertNewAth(request):
    if request.method == 'POST':
        json_string = JSONParser().parse(request)
        fio = normalizeFio(json_string.get('FIO'))
        br = json_string.get('dateBR')

        exists = checkIfAthleteExists(fio, br, None)

        if (exists):
            error = {"athlete": "exists"}

            return JsonResponse(error, status=422, safe = False)

        gender = json_string.get('gender')
        dan = json_string.get('DAN')
        weight = json_string.get('Weight')
        photo_name = json_string.get('Photo')
        photo_bytes = json_string.get('photo_bytes')
        coach_id = json_string.get('coachId')
        champ = json_string.get('title')
        kumite = json_string.get('Kumite')
        kata = json_string.get('Kata')
        kataGroup = json_string.get('KataGroup')
        favorit1 = json_string.get('Favorit1')
        favorit2= json_string.get('Favorit2')
        participant = json_string.get('Participant')
        division = json_string.get('Division')

        if all(i is None for i in [fio, br, gender, dan, weight, photo_name, coach_id, photo_bytes]):
            return HttpResponse(status=400)

        if (weight == "None" or weight == None) :
            weight = 0

        kumite = False if kumite == None or kumite == "" else True
        kata = False if kata == None or kata == "" else True
        kataGroup = False if kataGroup == None or kataGroup == "" else True
        favorit1 = False if favorit1 == None or favorit1 == "" else True
        favorit2 = False if favorit2 == None or favorit2 == "" else True
        participant = False if participant == None or participant == "" else True

        coach = Coaches.objects.get(coachId=coach_id)

        # print("============================")
        # cwd = os.getcwd()  # Get the current working directory (cwd)
        # files = os.listdir(cwd)  # Get all the files in that directory
        # print("Files in %r: %s" % (cwd, files))


        if photo_name is not None and photo_name != '' and photo_bytes is not None and photo_bytes != '':
            file_name, file_extension = os.path.splitext(photo_name)
            photo_name = randomString(8) + file_extension

            photo_bytes = photo_bytes.encode('utf-8')

            fileName = settings.ATHLETES_PHOTOS_LOCATION + photo_name

            with open(fileName, "wb") as fh:
                fh.write(base64.decodebytes(photo_bytes))

            photo_path_local = "/assets/media/athletes_photo/" + photo_name
        else :
            photo_path_local = ''

        cursor = connection.cursor()

        regionId = coach.regionId.regionId if coach.regionId is not None else 'null'
        clubId = coach.clubId.clubId if hasattr(coach, 'clubId') and coach.clubId is not None else 'null'

        query = (f'INSERT INTO athonline ' +
            f'(athId, CoachId, ClubId, CountryId, RegionId, FIO, Photo, DAN, Gender, DateBR, Weight, Participant, Kumite, Kata, KataGroup, Favorit1, Favorit2, Division)'
            f' VALUES ' +
            f'(null, {coach.coachId}, {clubId}, {coach.countryId.countryId}, {regionId}, "{fio}", "{photo_path_local}", "{dan}", "{gender}", "{br}", "{weight}", {participant}, {kumite}, {kata}, {kataGroup}, {favorit1}, {favorit2}, {division})')

        # print("=======================")
        # print(query)
        cursor.execute(query)

        cursor.execute(f'SELECT athId FROM athonline ORDER BY athId DESC LIMIT 1')
        res = fetch_all(cursor)
        _athId = res[0]['athId'] if len(res) > 0 else None

        if participant and _athId is not None and (champ is not None and champ != ''):
            cursor.execute(
                f'INSERT INTO {champ}_athchamp ' +
                f'(athId, CoachId, ClubId, CountryId, RegionId, FIO, Photo, DAN, Gender, DateBR, Age, Weight, Kumite, Kata, KataGroup, Favorit1, Favorit2) ' +
                f'SELECT athId, CoachId, ClubId, CountryId, RegionId, FIO, Photo, DAN, Gender, DateBR, Age, Weight, Kumite, Kata, KataGroup, Favorit1, Favorit2 ' +
                f'FROM athonline WHERE athId = {_athId}')

        responceData = {"athId" : _athId} if _athId is not None else {}

        return JsonResponse(responceData, status=200, safe = False)


@csrf_exempt
def InsertNewRefery(request):
    if request.method == 'POST':
        json_string = JSONParser().parse(request)
        fio = normalizeFio(json_string.get('FIO'))
        champ = json_string.get('title')

        exists = checkIfReferyExists(fio, champ, None)

        if (exists):
            error = {"refery": "exists"}

            return JsonResponse(error, status=422, safe = False)

        gender = json_string.get('Gender')
        dan = json_string.get('DAN')
        coach_id = json_string.get('coachId')

        if all(i is None for i in [fio, gender, dan, coach_id]):
            return HttpResponse(status=400)


        coach = Coaches.objects.get(coachId=coach_id)


        # print("============================")
        # cwd = os.getcwd()  # Get the current working directory (cwd)
        # files = os.listdir(cwd)  # Get all the files in that directory
        # print("Files in %r: %s" % (cwd, files))


        cursor = connection.cursor()

        # regionId = coach.regionId.regionId if coach.regionId is not None else 'null'
        clubId = coach.clubId.clubId if hasattr(coach, 'clubId') and coach.clubId is not None else 'null'

        query = (f'INSERT INTO {champ}_refery '
            f'(ReferyId, CoachId, ClubId, CountryId, FIO, DAN, Gender, TatamiId, BrigadeId)'
            f' VALUES ' +
            f'(null, {coach.coachId}, {clubId}, {coach.countryId.countryId}, "{fio}", "{dan}", "{gender}", 1, 0)')

        cursor.execute(query)

        query = (f'SELECT ReferyId FROM {champ}_refery ORDER BY ReferyId DESC LIMIT 1')

        cursor.execute(query)
        res = fetch_all(cursor)
        _referyId = res[0]['ReferyId'] if len(res) > 0 else None

        responceData = {"referyId" : _referyId} if _referyId is not None else {}

        return JsonResponse(responceData, status=200, safe = False)

@csrf_exempt
# @api_view(['POST'])
# @parser_classes([JSONParser])
def UpdateRefery(request):
    if request.method == 'POST':
        # try:

        json_string = JSONParser().parse(request)
        title = json_string.get('title')
        _fio = normalizeFio(json_string.get('FIO'))
        champ = json_string.get('title')
        referyId = json_string.get('ReferyId')

        exists = checkIfReferyExists(_fio, champ, referyId)

        if (exists):
            error = {"refery": "exists"}

            return JsonResponse(error, status=422, safe = False)


        # vk_dict = json_string.get('new_values')

        # if all(i is None for i in [title, fio, br, vk_dict]):
        #     return HttpResponse(status=400)


        _gender = json_string.get('Gender')
        _dan = json_string.get('DAN')

        try:
            cursor = connection.cursor()

            if (title is not None and title != '') :
                query = (f'UPDATE {title}_refery ' +
                            f'SET FIO = "{_fio}", ' +
                            f'Gender = "{_gender}", ' +
                            f'DAN = "{_dan}" ' +
                            f'WHERE ReferyId = {referyId}')
                cursor.execute(query)
        except Exception as e:
            # print(e)
            return HttpResponse(status=400)
        return HttpResponse(status=200)


@csrf_exempt
def UpdateReferyBrigade(request):
    if request.method == 'POST':
        json_string = JSONParser().parse(request)
        title = json_string.get('title')
        referyIds = json_string.get('referys')

        if all(i is None for i in [title, referyIds]):
            HttpResponse(status=400)

        _range=len(referyIds)

        for i in range(_range):
            referyRec = referyIds[i]  
            _referyId = referyRec.get('ReferyId')
            _tatamiId = referyRec.get('TatamiId')
            _brigadeId = referyRec.get('BrigadeId')
            _sushin = referyRec.get('sushin')

            if str.upper(str(_tatamiId)) == 'NONE':
               _tatamiId = '-1'
            if str.upper(str(_brigadeId)) == 'NONE':
               _brigadeId = '-1'
            if str.upper(str(_sushin)) == 'NONE':
               _sushin = '-1'

            try:
                cursor = connection.cursor()

                if (title is not None and title != '') :
                    query = (f'UPDATE {title}_refery ' +
                                f'SET TatamiId = "{_tatamiId}", ' +
                                f'BrigadeId = "{_brigadeId}", ' +
                                f'sushin = "{_sushin}" ' +
                                f'WHERE ReferyId = {_referyId}')
                    cursor.execute(query)
            except Exception as e:
                # print(e)
                return HttpResponse(status=400)
    return HttpResponse(status=200)

@csrf_exempt
def InsertAthIntoChamp(request):
    if request.method == 'POST':
        json_string = JSONParser().parse(request)
        title = json_string.get('title')
        athIds = json_string.get('athIds')

        # print(title, athIds)

        if all(i is None for i in [title, athIds]):
            HttpResponse(status=400)

        # try:
            # athIdsSql = ' or athId = '.join(athIds)

        cursor = connection.cursor()

        for athId in athIds :
            query = f'SELECT athId FROM {title}_athchamp WHERE athId = {athId} LIMIT 1'

            cursor.execute(query)

            arr = fetch_all(cursor)

            participantExists = False if len(arr) < 1 else [True if x is not None else False for x in arr][0]

            if not participantExists:
                # query=f'INSERT INTO {title}_athchamp (athId, CoachId, ClubId, CountryId, RegionId, FIO, Photo, DAN, Gender, DateBR, Weight, Kumite, Kata, KataGroup, Favorit1, Favorit2, Division) SELECT athId, CoachId, ClubId, CountryId, RegionId, FIO, Photo, DAN, Gender, DateBR, Weight, Kumite, Kata, KataGroup, Favorit1, Favorit2, Division, lvl1, lvl2, lvl3, lvl4, lvl5, lvl6, lvl7, lvl8, lvl12 FROM athonline WHERE athId = {athId}'
                query=f'INSERT INTO {title}_athchamp (athId, CoachId, ClubId, CountryId, RegionId, FIO, Photo, DAN, Gender, DateBR, Age, Weight, Kumite, Kata, KataGroup, Favorit1, Favorit2, Division) SELECT athId, CoachId, ClubId, CountryId, RegionId, FIO, Photo, DAN, Gender, DateBR, Age, Weight, Kumite, Kata, KataGroup, Favorit1, Favorit2, Division FROM athonline WHERE athId = {athId}'
                cursor.execute(query)
                cursor.execute(f'UPDATE athonline SET Participant = 1 WHERE EXISTS (SELECT athId FROM {title}_athchamp WHERE athId = {athId}) AND athId = {athId}')

                cursor.execute(f'SELECT CoachId, ClubId, CountryId FROM {title}_athchamp WHERE athId = {athId} LIMIT 1')
                arr = fetch_all(cursor)
                ath = arr[0]

                # add Coach to local clubs if doesnt exist
                addToLocalCoachesIfDoesntExist(title, ath["CoachId"])
                addToLocalClubsIfDoesntExist(title, ath["ClubId"])
            else:
                # raise Exception("already exist")
                pass
        # except Exception as e:
        #     print(e)
        #     return HttpResponse(status=400)
        return HttpResponse(status=200)

def addToLocalCoachesIfDoesntExist(title, coachId):
    cursor = connection.cursor()
    cursor.execute(f'SELECT CoachId, CoachName FROM coaches WHERE CoachId = {coachId} LIMIT 1')
    arr = fetch_all(cursor)
    coachExistsInGlobalCoaches = False if len(arr) < 1 else [True if x is not None else False for x in arr][0]

    if coachExistsInGlobalCoaches:
        cursor.execute(f'SELECT CoachId, CoachName FROM {title}_coach WHERE CoachId = {coachId} LIMIT 1')
        arr = fetch_all(cursor)
        coachExistsLocal = False if len(arr) < 1 else [True if x is not None else False for x in arr][0]

        if not coachExistsLocal:
            query = f'INSERT INTO {title}_coach (CoachId, ClubId, CoachName, CountryId, RegionId, City, Email, Password) SELECT CoachId, ClubId, CoachName, CountryId, RegionId, City, Email, Password FROM coaches WHERE CoachId = {coachId}'

            cursor.execute(query)
    # end

def addToLocalClubsIfDoesntExist(title, clubId):
    cursor = connection.cursor()

    cursor.execute(f'SELECT ClubId, ClubName FROM clubs WHERE ClubId = {clubId} LIMIT 1')
    arr = fetch_all(cursor)
    clubExistsInGlobalClubs = False if len(arr) < 1 else [True if x is not None else False for x in arr][0]

    if clubExistsInGlobalClubs:
        cursor.execute(f'SELECT ClubId, ClubName FROM {title}_club WHERE ClubId = {clubId} LIMIT 1')
        arr = fetch_all(cursor)
        clubExistsLocal = False if len(arr) < 1 else [True if x is not None else False for x in arr][0]

        if not clubExistsLocal:
            cursor.execute(f'INSERT INTO {title}_club (ClubId, ClubName, ClubShortName, ClubCity, RegionId, CountryId, ClubLogo, OrgId) SELECT ClubId, ClubName, ClubShortName, ClubCity, RegionId, CountryId, ClubLogo, OrgId FROM clubs WHERE ClubId = {clubId}')
    # end

@csrf_exempt
# @api_view(['POST'])
# @parser_classes([JSONParser])
def UpdateAth(request):
    if request.method == 'POST':
        # try:

        json_string = JSONParser().parse(request)
        title = json_string.get('title')
        # fio = json_string.get('FIO')
        # br = json_string.get('dateBR')
        _fio = normalizeFio(json_string.get('FIO'))
        _dateBR = json_string.get('dateBR')
        athId = json_string.get('athId')

        exists = checkIfAthleteExists(_fio, _dateBR, athId)

        if (exists):
            error = {"athlete": "exists"}

            return JsonResponse(error, status=422, safe = False)


        # vk_dict = json_string.get('new_values')

        # if all(i is None for i in [title, fio, br, vk_dict]):
        #     return HttpResponse(status=400)

        photo_bytes = json_string.get('photo_bytes')
        photo_name = json_string.get('Photo')

        if photo_name is  not None and photo_name != '' and photo_bytes is not None and photo_bytes != '':
            file_name, file_extension = os.path.splitext(photo_name)
            photo_name = randomString(8) + file_extension

            photo_bytes = photo_bytes.encode('utf-8')

            fileName = settings.ATHLETES_PHOTOS_LOCATION + photo_name

            with open(fileName, "wb") as fh:
                fh.write(base64.decodebytes(photo_bytes))

            photo_path_local = "/assets/media/athletes_photo/" + photo_name
            # vk_dict.pop('photo_byte')
        else :
            photo_path_local = ''


        _gender = json_string.get('gender')
        _weight = json_string.get('Weight')
        _dan = json_string.get('DAN')
        kumite = json_string.get('Kumite')
        kata = json_string.get('Kata')
        kataGroup = json_string.get('KataGroup')
        favorit1 = json_string.get('Favorit1')
        favorit2 = json_string.get('Favorit2')
        participant = json_string.get('Participant')
        division = json_string.get('Division')
        competition = json_string.get('teamcompetition')
        if (_weight == "None" or _weight == None or _weight == '') :
            _weight = 0

        if (division == "None" or division == None or division == '') :
            division = -1

        if (competition == "None" or competition == None or competition == '') :
            competition = 0

        kumite = False if kumite == None or kumite == "" or kumite == False or kumite == 0 else True
        kata = False if kata == None or kata == "" or kata == False or kata == 0 else True
        kataGroup = False if kataGroup == None or kataGroup == "" or kataGroup == False or kataGroup == 0 else True
        favorit1 = False if favorit1 == None or favorit1 == "" or favorit1 == False or favorit1 == 0 else True
        favorit2 = False if favorit2 == None or favorit2 == "" or favorit2 == False or favorit2 == 0 else True
        participant = False if participant == None or participant == "" or participant == False or participant == 0 else True

        try:
            cursor = connection.cursor()

            query = (f'UPDATE athonline ' +
                        f'SET FIO = "{_fio}", ' +
                        f'Photo = "{photo_path_local}", ' +
                        f'DateBR = "{_dateBR}", ' +
                        f'Gender = "{_gender}", ' +
                        f'Weight = {_weight}, ' +
                        f'DAN = "{_dan}", ' +
                        f'Participant = {participant}, ' +
                        f'Kumite = {kumite}, ' +
                        f'Kata = {kata}, ' +
                        f'KataGroup = {kataGroup}, ' +
                        f'Favorit1 = {favorit1}, ' +
                        f'Favorit2 = {favorit2}, ' +
                        f'Division = {division}, ' +
                        f'teamcompetition = {competition} ' +
                    # f'WHERE FIO = "{fio}" AND DateBR = "{br}"')
                    f'WHERE athId = {athId}')
            # print(query)
            cursor.execute(query)

            if (title is not None and title != '') :
                query = (f'UPDATE {title}_athchamp ' +
                            f'SET FIO = "{_fio}", ' +
                            f'Photo = "{photo_path_local}", ' +
                            f'DateBR = "{_dateBR}", ' +
                            f'Gender = "{_gender}", ' +
                            f'Weight = {_weight}, ' +
                            f'DAN = "{_dan}", ' +
                            f'Kumite = {kumite}, ' +
                            f'Kata = {kata}, ' +
                            f'KataGroup = {kataGroup}, ' +
                            f'Favorit1 = {favorit1}, ' +
                            f'Favorit2 = {favorit2}, ' +
                            f'Division = {division}, ' +
                            f'teamcompetition = {competition} ' +
                            # f'WHERE FIO = "{fio}" AND DateBR = "{br}"')
                            f'WHERE athId = {athId}')

                cursor.execute(query)
        except Exception as e:
            print(e)
            return HttpResponse(status=400)
        return HttpResponse(status=200)


@csrf_exempt
def GetChampInfo(request):
    if request.method == 'POST':
        json_string = JSONParser().parse(request)
        title = json_string.get('title')
        if title is not None:
            title = title.replace(" ", "_")
            cursor = connection.cursor()
            cursor.execute('SELECT * FROM champs WHERE title = "' + title + '"')
            result = dict_fetch_all(cursor)
            return JsonResponse(result, status=200)
        else:
            return HttpResponse(status=400)

@csrf_exempt
def GetCurrentValidChamp(request):
    if request.method == 'GET':
        current_date = datetime.today()

        try:
            with connection.cursor() as cursor:
                cursor.execute(f"SELECT * FROM champs WHERE champRegFrom <= '{current_date}' AND champRegTo >= '{current_date}' LIMIT 1")
                row = fetch_all(cursor)

            return JsonResponse(row, status=200, safe=False)
        except Exception as e:
            return JsonResponse(e, status=400, safe=False)


@csrf_exempt
def GetCurrentValidChampWithTitle(request):
    if request.method == 'POST':
        json_string = JSONParser().parse(request)
        title = json_string.get('title')

        current_date = datetime.today()

        try:
            with connection.cursor() as cursor:
                cursor.execute(f"SELECT * FROM champs WHERE title = '{title}' and champRegFrom <= '{current_date}' AND champRegTo >= '{current_date}' LIMIT 1")
                row = fetch_all(cursor)

            return JsonResponse(row, status=200, safe=False)
        except Exception as e:
            return JsonResponse(e, status=400, safe=False)


@csrf_exempt
def getAllBranchesReguesh(request):
    if request.method == 'POST':
        json_string = JSONParser().parse(request)
        title = json_string.get('title')

        with connection.cursor() as cursor:
            query = (
                f'SELECT coachId, coachName, blocked, coach_role.role, coach_role.details ' +
                 'FROM coaches '+
                 'LEFT JOIN branch ON coaches.branchId = branch.branchId ' +
                 f'LEFT JOIN coach_role ON (coaches.coachId = coach_role.coach_id AND details = "{title}") ' +
                 'ORDER BY coachName'
            )

            cursor.execute(query)


            result = fetch_all(cursor)
            return JsonResponse(result, safe=False)

@csrf_exempt
def getCoachesByBranchRequest(request, coachId):
    if request.method == 'GET':
        with connection.cursor() as cursor:
            cursor.execute(f'SELECT branch.branchId FROM coaches JOIN branch ON coaches.branchId = branch.branchId  WHERE coaches.coachId = {coachId}')
            row = fetch_all(cursor)
            if len(row) > 0:

                query = (
                    f'SELECT coachId, coachName, blocked ' +
                      f'FROM coaches ' +
                      f'JOIN branch ON coaches.branchId = branch.branchId ' +
                      f'WHERE branch.branchId = {row[0]["branchId"]}'
                )

                cursor.execute(query)

                result = fetch_all(cursor)
                return JsonResponse(result, status=200, safe=False)
            else:
                return JsonResponse(status=400)

@csrf_exempt
def BlockCoaches(request):
    if request.method == 'POST':
        json_string = JSONParser().parse(request)
        coachId = json_string.get('coachId')
        blocked = json_string.get('blocked')

        with connection.cursor() as cursor:
            cursor.execute(f'UPDATE coaches SET blocked = {blocked} WHERE coachId = {coachId}')
            return HttpResponse(status=200)


@csrf_exempt
def changeRoleRequest(request):
    if request.method == 'POST':
        json_string = JSONParser().parse(request)

        coachId = json_string.get('coachId')
        isTmanager = json_string.get('isTmanager')
        title = json_string.get('title')

        with connection.cursor() as cursor:
            if isTmanager == True:
                query = f"INSERT INTO coach_role (coach_id, role, details) VALUES ({coachId}, 1, '{title}')"
            else :
                query = f"DELETE FROM coach_role WHERE coach_id = {coachId} AND role = 1"

            cursor.execute(query)

    return HttpResponse(status=200)


@csrf_exempt
def GetAthList(request):
    if request.method == 'POST':
        title = request.POST.get('Title')
        # print(title)
        with connection.cursor() as cursor:
            try:
                query = f'''SELECT countryNameEn, regionNameEn, cityName, organization.orgName, clubName, coachName, FIO, Gender, DateBR, DAN, Weight, Kumite, Kata, KataGroup, Favorit1, Favorit2, Photo, Division, teamcompetition
                FROM {title}_athchamp
                LEFT JOIN countries ON {title}_athchamp.CountryId = countries.countryId
                LEFT JOIN regions ON {title}_athchamp.RegionId = regions.regionId
                LEFT JOIN coaches ON {title}_athchamp.CoachId = coaches.coachId
                LEFT JOIN city ON city.CityId = coaches.city
                LEFT JOIN clubs ON {title}_athchamp.ClubId = clubs.clubId
                LEFT JOIN organization ON organization.orgId = clubs.OrgId


                '''

                cursor.execute(query)
                result = fetch_all(cursor)
                # print(result)
                result_str = ''
                for _dict in result:
                    for key in _dict:
                        val = f'{_dict[key]}'.replace('\n', '').replace('\r', '')
                        result_str += f'{val};'
                    result_str += '\n'

                # result_str = "\n".join({result[x] for x in result})


                # _dict[key]
                # result_str = '\n'.join((';'.join(f'{_dict[key].replace('\n', '')}' for key in _dict) ) for _dict in result)

                # print("================================================================")
                # print(result_str)
                # json_result = json.dumps(result_str, ensure_ascii=False).encode('utf8')
                return HttpResponse(result_str, status=200)
                # return HttpResponse(result, status=200)
            except Exception as e:
                return HttpResponse(e, status=400)

@csrf_exempt
def GetAllCoaches(request):
    if request.method == 'GET':
        with connection.cursor() as cursor:
            cursor.execute(f'SELECT coachId, coachName FROM coaches WHERE coachName != "{settings.APP_SUPERADMIN}" ORDER BY coachName')
            result = fetch_all(cursor)
            return JsonResponse(result, status=200, safe=False)

@csrf_exempt
def GetAllClubs(request):
    if request.method == 'GET':
        with connection.cursor() as cursor:
            cursor.execute(f'SELECT clubId, clubName FROM clubs ORDER BY clubName')
            result = fetch_all(cursor)
            return JsonResponse(result, status=200, safe=False)


@csrf_exempt
def GetCoachById(request, coachId):
    if request.method == 'POST':
        json_string = JSONParser().parse(request)

        lng = json_string.get('lng')

        coach = Coaches.objects.get(coachId=coachId)

        lng = lng.capitalize()

        if (lng == "En") :
            country = coach.countryId.countryNameEn
            region = coach.regionId.regionNameEn if coach.regionId is not None else ''
        elif (lng == "Ru"):
            country = coach.countryId.countryNameRu
            region = coach.regionId.regionNameRu if coach.regionId is not None else ''
        elif (lng == "Ua"):
            country = coach.countryId.countryNameUa
            region = coach.regionId.regionNameUa if coach.regionId is not None else ''

        org = Organization.objects.get(orgId = coach.organizationId)
        # print("=================================")
        # print(org)
        # print("=================================")

        dict = {
            'username': coach.user.username,
            'email': coach.user.email,
            'country': country,
            'region': region,
            'city': coach.city.cityName if coach.city is not None else '',
            'club': coach.clubId.clubName if coach.clubId is not None else '',
            'organization': org.orgName,
            'branch': coach.branchId.branchName if coach.branchId is not None else '',
            # 'password': coach.password,
            # 'confirmPassword': coach.password
        }

        return JsonResponse(dict, status=200, safe=False)

@csrf_exempt
def UpdateCoach(request):
    if request.method == 'POST':
        json_string = JSONParser().parse(request)
        _coachId = json_string.get('coachId')
        _coachName = json_string.get('username')
        _email = json_string.get('email')
        _club = json_string.get('club')
        _countryId = json_string.get('country')
        _region = json_string.get('region')
        _city = json_string.get('city')
        _organization = json_string.get('organization')
        _branchId = json_string.get('branch')
        _password = json_string.get('password')

        country = Countries.objects.get(countryId=_countryId)

        try:
            region = Regions.objects.get(regionNameUa=_region)
        except:
            region = Regions.objects.create(regionNameUa=_region, countryId=country)

        try:
            city = City.objects.get(cityName=_city)
        except City.DoesNotExist as e:
            city = City.objects.create(cityName=_city, countryId=country, regionId=region)

        try:
            club = Clubs.objects.get(clubName=_club)
        except Clubs.DoesNotExist as e:
            club = Clubs.objects.create(clubName=_club, countryId=country, regionId=region)

        try:
            organization = Organization.objects.get(orgName=_organization)
        except:
            organization = Organization.objects.create(orgName=_organization)

        branch = None

        if _branchId is not None:
            branch = Branch.objects.get(branchId=_branchId)

        # TODO: Global coaches table is not used anymore
        coach = Coaches.objects.get(coachId=_coachId)

        user = User.objects.get(username=coach.coachName, email=coach.email)
        user.email = _email
        user.username = _coachName
        user.password = make_password(_password)
        user.save()

        coach.coachName = _coachName
        coach.email = _email
        coach.countryId = country
        coach.regionId = region
        coach.cityId = city
        coach.clubId = club
        coach.organizationId = organization
        coach.branchId = branch
        coach.password = _password
        coach.save()

        return HttpResponse(status=200)



@csrf_exempt
def setAllKumite(request):
    if request.method == 'POST':
        json_string = JSONParser().parse(request)
        title = json_string.get('title')
        coachId = json_string.get('coachId')
        set = json_string.get('set')
        set = 1 if set == True else 0

        cursor = connection.cursor()

        query = (f'UPDATE athonline ' +
                f'SET Kumite = "{set}"' +
                f'WHERE CoachId = {coachId}')

        cursor.execute(query)

        if (title is not None and title != '') :
            query = (f'UPDATE {title}_athchamp ' +
                    f'SET Kumite = "{set}"' +
                    f'WHERE CoachId = {coachId}')

            cursor.execute(query)

        return HttpResponse(status=200)


@csrf_exempt
def setAllKata(request):
    if request.method == 'POST':
        json_string = JSONParser().parse(request)
        title = json_string.get('title')
        coachId = json_string.get('coachId')
        set = json_string.get('set')
        set = 1 if set == True else 0

        cursor = connection.cursor()

        query = (f'UPDATE athonline ' +
                 f'SET Kata = "{set}"' +
                 f'WHERE CoachId = {coachId}')

        cursor.execute(query)

        if (title is not None and title != ''):
            query = (f'UPDATE {title}_athchamp ' +
                     f'SET Kata = "{set}"' +
                     f'WHERE CoachId = {coachId}')

            cursor.execute(query)

        return HttpResponse(status=200)
