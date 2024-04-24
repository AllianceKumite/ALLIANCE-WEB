from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from registration.models import AthletesImages, DrawImages, Clubs, Regions, \
    Coaches, City
from django.db import connection
from zipfile import ZipFile
# import os
import csv
from io import TextIOWrapper
import os
from django.conf import settings
from registration.serializers import tatami_one_fetch
from fight.helpers import *
import json
import codecs
import sys
import logging

# TODO: use request.data
#   https://www.django-rest-framework.org/api-guide/requests/
first_id_club_custom = 100000
first_id_coach_custom = 100000
first_id_ath_custom = 100000


@csrf_exempt
def Clubs_File(request):
    if request.method == 'POST':
        title = request.POST.get('Title')

        file = request.FILES.get('file')

        if title is None or file is None:

            HttpResponse(status=400)

        try:
            title = title.replace(" ", "_").lower()
            cursor = connection.cursor()
            cursor.execute('TRUNCATE TABLE ' + title + '_club')
            f = TextIOWrapper(file, encoding="utf-8")
            reader = csv.reader(f)
            for arr_of_values in reader:
                if len(arr_of_values) > 0:
                    # print()
                    # print("TEST: ", arr_of_values)
                    # print()
                    arr_of_values = arr_of_values[0].split(';')
                    arr_of_values = [x.replace('"', "") for x in arr_of_values]
                    club_name = arr_of_values[1]
                    arr_of_sql_values = [x if x.isdigit() else '"' + x + '"' for x in arr_of_values]
                    arr_of_sql_values = ['NULL' if x == 0 else x for x in arr_of_sql_values]
                    arr_of_sql_values = ['NULL' if x == '""' else x for x in arr_of_sql_values]
                    cursor.execute('INSERT INTO ' + title + '_club VALUES ( null, ' + ', '.join(arr_of_sql_values) + ' )')
        except Exception as e:
            # print(e)
            return HttpResponse(e, status=400)

    return HttpResponse(status=201)


@csrf_exempt
def Coach_File(request):
    if request.method == 'POST':
        title = request.POST.get('Title')
        file = request.FILES.get('file')
        if title is None or file is None:
            HttpResponse(status=400)

        title = title.replace(" ", "_").lower()
        cursor = connection.cursor()
        cursor.execute('TRUNCATE TABLE ' + title + '_coach')
        f = TextIOWrapper(file, encoding="utf-8")
        reader = csv.reader(f)
        for line in reader:
            if len(line) > 0:
                arr_of_values = line[0].split(';')
                arr_of_values = [x.replace('"', "`") for x in arr_of_values]
                for i in range(0, 8):
                    try:
                        y = arr_of_values[i]
                    except:
                        arr_of_values.append('NULL')
                coach_name = arr_of_values[2]
                arr_of_sql_values = [x if x.isdigit() else '"' + x + '"' for x in arr_of_values]
                arr_of_sql_values = ['NULL' if x == 0 else x for x in arr_of_sql_values]
                arr_of_sql_values = ['NULL' if x == '""' else x for x in arr_of_sql_values]

                cursor.execute('INSERT INTO ' + title + '_coach VALUES ( null, ' + ', '.join(arr_of_sql_values) +
                            ' )')

    return HttpResponse(status=201)

@csrf_exempt
def Clubs_Custom_File(request):
    if request.method == 'POST':
        title = request.POST.get('Title')
        file = request.FILES.get('file')

        if title is None or file is None:
            HttpResponse(status=400)

        try:
            title = title.replace(" ", "_").lower()
            cursor = connection.cursor()
            cursor.execute(f'DELETE FROM {title}_club WHERE ClubId >= {first_id_club_custom}')
            f = TextIOWrapper(file, encoding="utf-8")
            reader = csv.reader(f)
            # print(reader)
            for arr_of_values in reader:
                # print(arr_of_values)
                if len(arr_of_values) > 0:
                    arr_of_values = arr_of_values[0].split(';')
                    arr_of_values = [x.replace('"', "") for x in arr_of_values]

                    club_id = str(int(arr_of_values[0]) + first_id_club_custom)
                    arr_of_values[0] = club_id 

                    arr_of_sql_values = [x if x.isdigit() else '"' + x + '"' for x in arr_of_values]
                    arr_of_sql_values = ['NULL' if x == 0 else x for x in arr_of_sql_values]
                    arr_of_sql_values = ['NULL' if x == '""' else x for x in arr_of_sql_values]
                    cursor.execute('INSERT INTO ' + title + '_club VALUES ( null, ' + ', '.join(arr_of_sql_values) + ' )')
        except Exception as e:
            print(e)
            return HttpResponse(e, status=400)

    return HttpResponse(status=201)


@csrf_exempt
def Coach_Custom_File(request):
    if request.method == 'POST':

        title = request.POST.get('Title')
        file = request.FILES.get('file')
        if title is None or file is None:
            HttpResponse(status=400)

        title = title.replace(" ", "_").lower()
        cursor = connection.cursor()
        cursor.execute(f'DELETE FROM {title}_coach WHERE ClubId >= {first_id_club_custom}')

        f = TextIOWrapper(file, encoding="utf-8")
        reader = csv.reader(f)
        for line in reader:
            if len(line) > 0:
                try:
                    arr_of_values = line[0].split(';')
                    arr_of_values = [x.replace('"', "`") for x in arr_of_values]
                    for i in range(0, 8):
                        try:
                            y = arr_of_values[i]
                        except:
                            arr_of_values.append('NULL')

                    coach_id = str(int(arr_of_values[0]) + first_id_coach_custom)
                    arr_of_values[0] = coach_id 

                    club_id = str(int(arr_of_values[1]) + first_id_club_custom)
                    arr_of_values[1] = club_id 

                    coach_name = arr_of_values[2]
                    arr_of_sql_values = [x if x.isdigit() else '"' + x + '"' for x in arr_of_values]
                    arr_of_sql_values = ['NULL' if x == 0 else x for x in arr_of_sql_values]
                    arr_of_sql_values = ['NULL' if x == '""' else x for x in arr_of_sql_values]

                    cursor.execute(f'INSERT INTO ' + title + '_coach VALUES ( null, ' + ', '.join(arr_of_sql_values) +
                                ' )')
                except:
                    return HttpResponse(arr_of_values)
    return HttpResponse(status=201)


@csrf_exempt
# api-champ-set-participants
def Participants_File(request):
    if request.method == 'POST':

        title = request.POST.get('Title')
        file = request.FILES.get('file')
        if title is None or file is None:
            HttpResponse(status=400)
        # try:
        title = title.replace(" ", "_").lower()
        cursor = connection.cursor()
        cursor.execute('TRUNCATE TABLE ' + title + '_athchamp')
        f = TextIOWrapper(file, encoding="utf-8")
        reader = csv.reader(f)
        # i = 0
        for line in reader:
            if len(line) > 0:
                # i = i + 1
                # print('==============================')
                # print(i)
                # print('==============================')
                arr_of_values = line[0].split(';')
                arr_of_values = [x.replace('"', "`") for x in arr_of_values]
                # categories = arr_of_values[5]
                # categories = categories.split(":")
                fio = arr_of_values[7]
                # print(fio)
                fio = ' '.join(fio.split(' ')[:-1])
                # print(fio)
                arr_of_values[11] = arr_of_values[11][6:] + '-' + arr_of_values[11][3:5] + '-' + arr_of_values[11][:2]
                date_br = arr_of_values[11]
                gender = arr_of_values[10]
                if gender == '1':
                    arr_of_values[10] = 'Ч(M)'
                else:
                    arr_of_values[10] = 'Ж(F)'

                # print(date_br)
                arr_of_sql_values = [x if x.isdigit() else '"' + x + '"' for x in arr_of_values]
                # print('arr_of_sql_values')
                # print(arr_of_sql_values)
                arr_of_values = ['NULL' if x == '0' else x for x in arr_of_values]
                # print('arr_of_values')
                # print(arr_of_values)

                # Last Three 0-s - CountVazary CountIppon, CountRefery
                # print(arr_of_sql_values)
                query = (
                    f'INSERT INTO {title}_athchamp' +
                    '(athId, CoachId, ClubId, CountryId, RegionId, CategoryId, Category2Id, FIO, Photo, DAN, Gender, DateBR, Weight, CountWinner, CountBall, CountBallKata, OrdNum, Kumite, Kata, KataGroup, Favorit1, Favorit2, teamcompetition, CountVazary, CountIppon, CountRefery ) ' +
                    'VALUES ('+ ', '.join(arr_of_sql_values) + ', 0, 0, 0' + ' )'
                )

                # print('query')
                # print(query)

                cursor.execute(query)
                # cursor.execute('SELECT athId FROM athletes WHERE LOCATE("' + fio + '", FIO) != 0 AND dateBR = "'
                            # + date_br + '"')
                # athId = cursor.fetchall()
                # if athId != ():
                #     athId = athId[0][0]
                #     cursor.execute('UPDATE athletes SET photo = "' + arr_of_values[7] + '", DAN = "'
                #                 + arr_of_values[8] + '", weight = ' + arr_of_values[11] + ' WHERE athId = '
                #                 + str(athId))
                # else:
                #     print('TETETETETE', arr_of_values[1])
                #     cursor.execute('INSERT INTO athletes VALUES ( null, "' + arr_of_values[6] + '", "'
                #                 + arr_of_values[7] + '", "' + arr_of_values[8] + '", "'
                #                 + arr_of_values[9] + '", "' + date_br + '", ' + arr_of_values[11] +
                #                 ', (SELECT clubId FROM clubs WHERE clubName = ' +
                #                 '(SELECT clubName FROM ' + title + '_club WHERE clubId = '
                #                 + arr_of_values[2] + ' LIMIT 1) LIMIT 1), (SELECT coachId FROM coaches WHERE coachName = '
                #                 + '(SELECT coachName FROM '
                #                 + title + '_coach WHERE coachId = ' + arr_of_values[1] + ' LIMIT 1) LIMIT 1), '
                #                 + arr_of_values[3] + ', ' + arr_of_values[4] + ' )')
                #     print('TETETETE222222222222222')
        # except Exception as e:
        #     return HttpResponse(e)

    return HttpResponse(status=201)

    if request.method == 'POST':

        title = request.POST.get('Title')
        file = request.FILES.get('file')
        if title is None or file is None:
            HttpResponse(status=400)

        title = title.replace(" ", "_").lower()
        cursor = connection.cursor()
        cursor.execute(f'DELETE FROM {title}_athchamp WHERE ClubId >= {first_id_club_custom}')

        f = TextIOWrapper(file, encoding="utf-8")
        reader = csv.reader(f)
        for line in reader:
            if len(line) > 0:
                arr_of_values = line[0].split(';')
                arr_of_values = [x.replace('"', "`") for x in arr_of_values]
                for i in range(0, 8):
                    try:
                        y = arr_of_values[i]
                    except:
                        arr_of_values.append('NULL')

                coach_id = str(int(arr_of_values[0]) + first_id_coach_custom)
                arr_of_values[0] = coach_id 

                club_id = str(int(arr_of_values[1]) + first_id_club_custom)
                arr_of_values[1] = club_id 

                coach_name = arr_of_values[2]
                arr_of_sql_values = [x if x.isdigit() else '"' + x + '"' for x in arr_of_values]
                arr_of_sql_values = ['NULL' if x == 0 else x for x in arr_of_sql_values]
                arr_of_sql_values = ['NULL' if x == '""' else x for x in arr_of_sql_values]

                cursor.execute('INSERT INTO ' + title + '_coach VALUES ( null, ' + ', '.join(arr_of_sql_values) +
                            ' )')
    return HttpResponse(status=201)

@csrf_exempt
# api-champ-set-participants
def Participants_Custom_File(request):
    if request.method == 'POST':

        title = request.POST.get('Title')
        file = request.FILES.get('file')
        if title is None or file is None:
            HttpResponse(status=400)
        # try:
        title = title.replace(" ", "_").lower()
        cursor = connection.cursor()
        cursor.execute(f'DELETE FROM {title}_athchamp WHERE ClubId >= {first_id_club_custom}')

        f = TextIOWrapper(file, encoding="utf-8")
        reader = csv.reader(f)
        # i = 0
        for line in reader:
            if len(line) > 0:
                arr_of_values = line[0].split(';')
                arr_of_values = [x.replace('"', "`") for x in arr_of_values]

                ath_id = str(int(arr_of_values[0]) + first_id_coach_custom)
                arr_of_values[0] = ath_id 

                coach_id = str(int(arr_of_values[1]) + first_id_coach_custom)
                arr_of_values[1] = coach_id 

                club_id = str(int(arr_of_values[2]) + first_id_club_custom)
                arr_of_values[2] = club_id 

                fio = arr_of_values[7]
                fio = ' '.join(fio.split(' ')[:-1])
                arr_of_values[11] = arr_of_values[11][6:] + '-' + arr_of_values[11][3:5] + '-' + arr_of_values[11][:2]
                date_br = arr_of_values[11]
                gender = arr_of_values[10]
                if gender == '1':
                    arr_of_values[10] = 'Ч(M)'
                else:
                    arr_of_values[10] = 'Ж(F)'
                arr_of_sql_values = [x if x.isdigit() else '"' + x + '"' for x in arr_of_values]
                arr_of_values = ['NULL' if x == '0' else x for x in arr_of_values]

                query = (
                    f'INSERT INTO {title}_athchamp' +
                    '(athId, CoachId, ClubId, CountryId, RegionId, CategoryId, Category2Id, FIO, Photo, DAN, Gender, DateBR, Weight, CountWinner, CountBall, OrdNum, Kumite, Kata, KataGroup, Favorit1, Favorit2, CountVazary, CountIppon, CountRefery ) ' +
                    'VALUES ('+ ', '.join(arr_of_sql_values) + ', 0, 0, 0' + ' )'
                )

                cursor.execute(query)

    return HttpResponse(status=201)

@csrf_exempt
def Champ_File(request):
    if request.method == 'POST':

        title = request.POST.get('Title')
        file = request.FILES.get('file')
        if title is None or file is None:
            HttpResponse(status=400)
        try:
            title = title.replace(" ", "_").lower()
            cursor = connection.cursor()
            cursor.execute('TRUNCATE TABLE ' + title + '_champ')
            f = TextIOWrapper(file, encoding="utf-8")
            reader = csv.reader(f)
            for line in reader:
                if len(line) > 0:
                    arr_of_values = line[0].split(';')
                    arr_of_values = [x.replace('"', "`") for x in arr_of_values]
                    arr_of_sql_values = [x if x.isdigit() else '"' + x + '"' for x in arr_of_values]
                    # Last 0-s - for not sent last fields in a table
                    zero19 = ', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0'
                    cursor.execute('INSERT INTO ' + title + '_champ VALUES ( null, ' + ', '.join(arr_of_sql_values) + zero19
                                + ' )')

        except Exception as e:
            return HttpResponse(e, status=400)

    return HttpResponse(status=201)

@csrf_exempt
def updateTatamiChampt(request):
    if request.method == 'POST':

        title = request.POST.get('Title')
        file = request.FILES.get('file')
        if title is None or file is None:
            HttpResponse(status=400)

        title = title.replace(" ", "_").lower()
        cursor = connection.cursor()
        # cursor.execute('TRUNCATE TABLE ' + title + '_champ')
        f = TextIOWrapper(file, encoding="utf-8")
        reader = csv.reader(f)
        totalRowsUpdated = 0

        # print(" ================================================= ")
        # print(" updateTatamiChampt ")

        totalRows = 0
        for line in reader:
            if len(line) > 0:
                totalRows += 1
                arr_of_values = line[0].split(';')
                arr_of_values = [x.replace('"', "`") for x in arr_of_values]
                arr_of_sql_values = [x if x.isdigit() else '"' + x + '"' for x in arr_of_values]

                tatamiId = str(arr_of_values[0])
                numDuel = int(arr_of_values[5])

                # print(numDuel)

                if numDuel > 0:
                    categoryId = str(arr_of_values[1])
                    blockNum = str(arr_of_values[2])
                    athIdRed = str(arr_of_values[3])
                    athIdWhite = str(arr_of_values[4])

                    nextDuel = str(arr_of_values[6])
                    duelIsPlace = str(arr_of_values[7])
                    winnerRed = str(arr_of_values[8])
                    winnerWhite = str(arr_of_values[9])
                    level = str(arr_of_values[10])
                    duel1Place = str(arr_of_values[11])
                    duel3Place = str(arr_of_values[12])
                    duel5Place = str(arr_of_values[13])
                    duel7Place = str(arr_of_values[14])
                    levePair = str(arr_of_values[15])
                    numPair = str(arr_of_values[16])
                    upDuelRed = str(arr_of_values[17])
                    upDuelWhite = str(arr_of_values[18])
                    pointsRed = str(arr_of_values[19])
                    pointsWhite = str(arr_of_values[20])

                    query = ('UPDATE ' + title + '_champ ' +
                            'SET ' +
                                f'BlockNum = {blockNum}, ' +
                                f'AthIdRed = {athIdRed}, ' +
                                f'AthIdWhite = {athIdWhite}, ' +
                                f'NextDuel = {nextDuel}, ' +
                                f'DuelIsPlace = {duelIsPlace}, ' +
                                f'WinnerRed = {winnerRed}, ' +
                                f'WinnerWhite = {winnerWhite}, ' +
                                f'Level = {level}, ' +
                                f'Duel1Place = {duel1Place}, ' +
                                f'Duel3Place = {duel3Place}, ' +
                                f'Duel5Place = {duel5Place}, ' +
                                f'Duel7Place = {duel7Place}, ' +
                                f'LevePair = {levePair}, ' +
                                f'NumPair = {numPair}, ' +
                                f'UpDuelRed = {upDuelRed}, ' +
                                f'UpDuelWhite = {upDuelWhite}, ' +
                                f'pointsRed = {pointsRed}, ' +
                                f'pointsWhite = {pointsWhite} ' +
                            'WHERE ' +
                                f'TatamiId = {tatamiId} AND ' +
                                f'CategoryId = {categoryId} AND ' +
                                f'NumDuel = {numDuel}'
                    )


                    currentQueryRowsUpdated = cursor.execute(query)
                    totalRowsUpdated += currentQueryRowsUpdated

                    # print(f'updated {currentQueryRowsUpdated} rows for query ')
                    # print(query)
                # else:
                    # print('numDuel is 0, updating nothing')

                    # if (currentQueryRowsUpdated == 0) :
                    #     print('updated 0 rows ror query ')


        # print('Total rows updated: ' + str(totalRowsUpdated) + ' / ' + str(totalRows))
        # print(" ================================================= ")
        # except:
        #     return HttpResponse(status=400)

    return HttpResponse(totalRowsUpdated, status=201)

@csrf_exempt
def Category_File(request):
    if request.method == 'POST':

        title = request.POST.get('Title')
        file = request.FILES.get('file')
        if title is None or file is None:
            HttpResponse(status=400)
        try:
            title = title.replace(" ", "_").lower()

            cursor = connection.cursor()
            cursor.execute('TRUNCATE TABLE ' + title + '_category')
            f = TextIOWrapper(file, encoding="utf-8")
            reader = csv.reader(f)
            for line in reader:
                if len(line) > 0:
                    # print(line)
                    arr_of_values = line[0].split(';')
                    arr_of_values = [x.replace('"', "`") for x in arr_of_values]
                    arr_of_sql_values = [x if x.isdigit() else '"' + x + '"' for x in arr_of_values]
                    arr_of_sql_values = ['null' if x == '""' else x for x in arr_of_sql_values]
                    for x in range(0, 17):
                        try:
                            i = arr_of_sql_values[x]
                        except:
                            arr_of_sql_values.append('NULL')
                    
                    query = 'INSERT INTO ' + title + '_category VALUES ( null, ' + ', '.join(arr_of_sql_values) + ' )'
                    # print(query)
                    cursor.execute('INSERT INTO ' + title + '_category VALUES ( null, ' + ', '.join(arr_of_sql_values) + ' )')
        except Exception as e:
            # print('EXCEPTION: ', e)
            return HttpResponse(e, status=400)

        generateTranslations()

    return HttpResponse(status=201)

@csrf_exempt
def Table_Kata_File(request):
    if request.method == 'POST':

        title = request.POST.get('Title')
        file = request.FILES.get('file')
        if title is None or file is None:
            HttpResponse(status=400)
        try:
            title = title.replace(" ", "_").lower()

            cursor = connection.cursor()
            cursor.execute('TRUNCATE TABLE ' + title + '_kata')
            f = TextIOWrapper(file, encoding="utf-8")
            reader = csv.reader(f)
            for line in reader:
                if len(line) > 0:
                    arr_of_values = line[0].split(';')
                    arr_of_values = [x.replace('"', "`") for x in arr_of_values]
                    arr_of_sql_values = [x if x.isdigit() else '"' + x + '"' for x in arr_of_values]
                    arr_of_sql_values = ['null' if x == '""' else x for x in arr_of_sql_values]

                    query='INSERT INTO ' + title + '_kata VALUES ( null, ' + ', '.join(arr_of_sql_values) + ' )'
                    # print(query)
                    cursor.execute(query)
        except Exception as e:
            # print('EXCEPTION: ', e)
            return HttpResponse(e, status=400)

        generateTranslations()

    return HttpResponse(status=201)

@csrf_exempt
def Table_KataGroup_File(request):
    if request.method == 'POST':

        title = request.POST.get('Title')
        file = request.FILES.get('file')
        if title is None or file is None:
            HttpResponse(status=400)
        try:
            logging.info("An INFO")
            title = title.replace(" ", "_").lower()

            cursor = connection.cursor()
            cursor.execute('TRUNCATE TABLE ' + title + '_katagroup')
            f = TextIOWrapper(file, encoding="utf-8")
            reader = csv.reader(f)
            for line in reader:
                if len(line) > 0:
                    # line[0].encode('utf-8').strip();
                    logging.info("An INFO LINE")
                    arr_of_values = line[0].split(';')
                    arr_of_values = [x.replace('"', "`") for x in arr_of_values]
                    arr_of_sql_values = [x if x.isdigit() else '"' + x + '"' for x in arr_of_values]
                    arr_of_sql_values = ['null' if x == '""' else x for x in arr_of_sql_values]

                    query = 'INSERT INTO ' + title + '_katagroup VALUES ( null, ' + ', '.join(arr_of_sql_values) + ' )'
                    # print(query)
                    cursor.execute(query)
        except Exception as e:
            # print('EXCEPTION: ', e)
            logging.error(e,exc_info=True)
            return HttpResponse(e, status=400)

        generateTranslations()

    return HttpResponse(status=201)

@csrf_exempt
def Params_Page(request):
    if request.method == 'POST':
        try:
            title = request.POST.get('Title').lower()
            DateStartReg = request.POST['DateStartReg']
            DateEndReg = request.POST['DateEndReg']
            DateBeginChip = request.POST['DateBeginChip']
            DateEndChip = request.POST['DateEndChip']
            NameChipEn = request.POST['NameChipEn']
            NameChipRu = request.POST['NameChipRu']
            NameChipUa = request.POST['NameChipUa']
            CityEn = request.POST['CityEn']
            CityRu = request.POST['CityRu']
            CityUa = request.POST['CityUa']
            TypeChip = request.POST['TypeChip']
            TypeTatami = request.POST['TypeTatami']
            TypeCheckCircle = request.POST['TypeCheckCircle']
            addressUa = request.POST['AddressUa']
            addressRu = request.POST['AddressRu']
            addressEn = request.POST['AddressEn']
            champInfoUa = request.POST['ChampInfoUa']
            champInfoRu = request.POST['ChampInfoRu']
            champInfoEn = request.POST['ChampInfoEn']
            emailorg = request.POST['Emailorg']
            emailtech = request.POST['Emailtech']
            orgid = request.POST['OrgId']
            teamcompetition = request.POST['TeamCompetition']

            # print('orgId=', orgid)


            NameChipEn = NameChipEn.replace('"', "`")
            NameChipRu = NameChipRu.replace('"', "`")
            NameChipUa = NameChipUa.replace('"', "`")

            if all(i is None for i in [title, DateStartReg, DateEndReg, DateBeginChip, DateEndChip,
                                        NameChipEn, NameChipUa, NameChipRu, CityEn, CityRu, CityUa, TypeChip, TypeTatami]):
                HttpResponse(status=400)
            title = title.replace(" ", "_")
            cursor = connection.cursor()

            query = ('UPDATE champs ' +
                            "SET champRegFrom = %s, " +
                                'champRegTo = %s, ' +
                                'champFrom = %s, ' +
                                'champTo = %s, ' +
                                'champNameUa = %s, ' +
                                'champNameEn = %s, ' +
                                'champNameRu = %s, ' +
                                'champCityUa = %s, ' +
                                'champCityEn = %s, ' +
                                'champCityRu = %s, ' +
                                'champType = %s, ' +
                                'typeTatami = %s, ' +
                                'typeCheckCircle = %s, ' +
                                'actualTime = 0, '  +
                                'addressUa = %s, ' +
                                'addressRu = %s, ' +
                                'addressEn = %s, ' +
                                'champInfoUa = %s, ' +
                                'champInfoRu = %s, ' +
                                'champInfoEn = %s, ' +
                                'emailorg = %s, ' +
                                'emailtech = %s, ' +
                                'orgId = %s, ' +
                                'teamcompetition = %s ' +
                            ' WHERE title = %s')
            # print("====================")
            # print(query)

            cursor.execute(query,(
                DateStartReg,
                DateEndReg,
                DateBeginChip,
                DateEndChip,
                NameChipUa,
                NameChipEn,
                NameChipRu,
                CityUa,
                CityEn,
                CityRu,
                str(TypeChip),
                str(TypeTatami),
                str(TypeCheckCircle),
                addressUa,
                addressRu,
                addressEn,
                champInfoUa,
                champInfoRu,
                champInfoEn,
                emailorg,
                emailtech,
                orgid,
                teamcompetition,
                title
          ))
        except Exception as e:
            # print('EXCEPTION: ', e)
            return HttpResponse(e, status=400)

        generateTranslations()

    return HttpResponse(status=201)


@csrf_exempt
def Photo_Participant(request):
    if request.method == 'POST':

        title = request.POST.get('Title')
        file = request.FILES.get('file')
        if file is None:
            HttpResponse(status=400)
        try:
            title = title.lower()

            zipF = ZipFile(file, 'r')
            zipF.extractall('media/athletes_photo/' + title)
            file_names = zipF.namelist()
            for it in file_names:
                AthletesImages(image='athletes_photo/' + title + '/' + it).save()
        except:
            return HttpResponse(status=400)

    return HttpResponse(status=201)


@csrf_exempt
def File_PNG_Category(request):
    if request.method == 'POST':
        title = request.POST.get('Title').lower()
        file = request.FILES.get('file')
        if file is None:
            HttpResponse(status=400)
        try:
            with ZipFile(file, 'r') as zipF:
                file_names = zipF.namelist()
                for it in file_names:
                    DrawImages(image=it).save()

                zipF.extractall('media/draw_photo/' + title)
        except:
            return HttpResponse(status=418)

    return HttpResponse(status=201)


@csrf_exempt
def Set_Ath_Final(request):
    if request.method == 'POST':
        title = request.POST.get('Title')
        file = request.FILES.get('file')
        if title is None or file is None:
            HttpResponse(status=400)
        title = title.replace(" ", "_").lower()
        try:
            f = TextIOWrapper(file, encoding="utf-8")
            reader = csv.reader(f)
            for line in reader:
                if len(line) > 0:
                    arr_of_values = line[0].split(';')
                    cursor = connection.cursor()
                    cursor.execute('UPDATE ' + title + '_category ' +
                                    'SET ' +
                                        'IdxAth1Place = ' + str(arr_of_values[1]) + ', ' +
                                        'IdxAth2Place = ' + str(arr_of_values[2]) + ', ' +
                                        'IdxAth3Place = ' + str(arr_of_values[3]) + ', ' +
                                        'IdxAth4Place = ' + str(arr_of_values[4]) + ', ' +
                                        'IdxAth5Place = ' + str(arr_of_values[5]) + ', ' +
                                        'IdxAth6Place = ' + str(arr_of_values[6]) + ', ' +
                                        'IdxAth7Place = ' + str(arr_of_values[7]) + ', ' +
                                        'IdxAth8Place = ' + str(arr_of_values[8]) + ' ' +
                                    'WHERE CategoryId = ' + str(arr_of_values[0]))

        except:
            return HttpResponse(status=400)

    return HttpResponse(status=201)

# deprecated
@csrf_exempt
def All_File_Champ(request):
    if request.method == 'POST':

        title = request.POST.get('Title')
        zip_file = request.FILES.get('file')
        if title is None or zip_file is None:
            HttpResponse(status=400)
        try:

            title = title.replace(" ", "_").lower()
            cursor = connection.cursor()
            archive = ZipFile(zip_file, 'r')

            fn_clubs = archive.open('FNClubs.txt')
            lines_clubs = fn_clubs.readlines()
            cursor.execute('TRUNCATE TABLE ' + title + '_club')
            for line in lines_clubs:
                line_decoded = line.strip().decode("utf-8")
                arr_of_values = line_decoded.split(';')
                club_name = arr_of_values[1]
                arr_of_sql_values = [x if x.isdigit() else '"' + x + '"' for x in arr_of_values]
                arr_of_sql_values = ['null' if x == '""' else x for x in arr_of_sql_values]
                cursor.execute('INSERT INTO ' + title + '_club VALUES ( null, ' + ', '.join(arr_of_sql_values) +
                               ' )')
                # Commented out saving to global clubs
                # cursor.execute('SELECT * FROM clubs WHERE ClubName = "' + club_name + '"')
                # if cursor.fetchall() == ():
                #     Clubs(clubName=arr_of_values[1], clubShortName=arr_of_values[2],
                #                 clubCity=arr_of_values[3], regionId=Regions.objects.get(pk=int(arr_of_values[4])),
                #                 countryId=Countries.objects.get(pk=int(arr_of_values[5])),
                #                 clubLogo=arr_of_values[6]).save()
                # else:
                #     pass
            fn_clubs.close()

            fn_coach = archive.open('FNCoach.txt')
            lines_coach = fn_coach.readlines()
            cursor.execute('TRUNCATE TABLE ' + title + '_coach')
            for line in lines_coach:
                line_decoded = line.strip().decode("utf-8")
                arr_of_values = line_decoded.split(';')
                coach_name = arr_of_values[2]
                arr_of_sql_values = [x if x.isdigit() else '"' + x + '"' for x in arr_of_values]
                arr_of_sql_values = ['null' if x == '""' else x for x in arr_of_sql_values]
                cursor.execute('INSERT INTO ' + title + '_coach VALUES ( null, ' + ', '.join(arr_of_sql_values) +
                               ' )')

                # cursor.execute('SELECT * FROM coaches WHERE CoachName = "' + coach_name + '"')
                # if cursor.fetchall() == ():
                #     cursor.execute('SELECT clubId FROM ' +
                #                    'clubs WHERE clubName = ( SELECT clubName FROM ' + title +
                #                    '_club WHERE ClubId = ' + arr_of_values[1] + ' )')

                #     Coaches(clubId=Clubs.objects.get(pk=cursor.fetchall()[0][0]),
                #                   coachName=arr_of_values[2],
                #                   countryId=Countries.objects.get(pk=int(arr_of_values[3])),
                #                   regionId=Regions.objects.get(pk=int(arr_of_values[4])),
                #                   email=arr_of_values[6],
                #                   password=arr_of_values[7],
                #                   city=arr_of_values[5]).save()
                # else:
                #     pass
            fn_coach.close()

            fn_participant = archive.open('FNParticipant.txt')
            lines_participant = fn_participant.readlines()
            cursor.execute('TRUNCATE TABLE ' + title + '_athchamp')
            for line in lines_participant:
                line_decoded = line.strip().decode("utf-8")
                arr_of_values = line_decoded.split(';')
                fio = arr_of_values[6]
                fio = ' '.join(fio.split(' ')[:-1])
                date_br = arr_of_values[10]
                arr_of_sql_values = [x if x.isdigit() else '"' + x + '"' for x in arr_of_values]
                arr_of_sql_values = ['null' if x == '""' else x for x in arr_of_sql_values]
                cursor.execute('INSERT INTO ' + title + '_athchamp VALUES ( null, ' + ', '.join(arr_of_sql_values)
                               + ' )')
                # cursor.execute('SELECT athId FROM athletes WHERE LOCATE("' + fio + '", FIO) != 0 AND dateBR = "'
                #                + date_br + '"')
                # athId = cursor.fetchall()
                # if athId != ():
                #     athId = athId[0][0]
                #     cursor.execute('UPDATE athletes SET photo = "' + arr_of_values[7] + '", DAN = "'
                #                    + arr_of_values[8] + '", weight = ' + arr_of_values[11] + ' WHERE athId = '
                #                    + str(athId))
                # else:
                #     cursor.execute('INSERT INTO athletes VALUES ( null, "' + arr_of_values[6] + '", "'
                #                    + arr_of_values[7] + '", "' + arr_of_values[8] + '", "'
                #                    + arr_of_values[9] + '", "' + date_br + '", ' + arr_of_values[11] +
                #                    ', (SELECT clubId FROM clubs WHERE clubName = ' +
                #                    '(SELECT clubName FROM ' + title + '_club WHERE clubId = '
                #                    + arr_of_values[2] + ')), (SELECT coachId FROM coaches WHERE coachName = '
                #                    + '(SELECT coachName FROM '
                #                    + title + '_coach WHERE coachId = ' + arr_of_values[1] + ')), '
                #                    + arr_of_values[3] + ', ' + arr_of_values[5] + ' )')
            fn_participant.close()

            fn_category = archive.open('FNCategory.txt')
            lines_category = fn_category.readlines()
            cursor.execute('TRUNCATE TABLE ' + title + '_category')
            for line in lines_category:
                line_decoded = line.strip().decode("utf-8")
                arr_of_values = line_decoded.split(';')
                arr_of_sql_values = [x if x.isdigit() else '"' + x + '"' for x in arr_of_values]
                arr_of_sql_values = ['null' if x == '""' else x for x in arr_of_sql_values]
                cursor.execute('INSERT INTO ' + title + '_category VALUES ( null, ' + ', '.join(arr_of_sql_values) + ' )')
            fn_category.close()

            fn_champ = archive.open('FNChamp.txt')
            cursor.execute('TRUNCATE TABLE ' + title + '_champ')
            lines_champ = fn_champ.readlines()
            for line in lines_champ:
                line_decoded = line.strip().decode("utf-8")
                arr_of_values = line_decoded.split(';')
                arr_of_sql_values = [x if x.isdigit() else '"' + x + '"' for x in arr_of_values]
                arr_of_sql_values = ['null' if x == '""' else x for x in arr_of_sql_values]
                cursor.execute('INSERT INTO ' + title + '_champ VALUES ( null, ' + ', '.join(arr_of_sql_values)
                               + ' )')
            fn_champ.close()
        except:
            HttpResponse(status=400)

    return HttpResponse(status=200)


@csrf_exempt
def Set_Duel_Tatami(request):
    if request.method == 'POST':
        title = request.POST.get('Title')
        file = request.FILES.get('file').lower()
        if all(i is None for i in [file , title]):
            HttpResponse(status=400)
        f = TextIOWrapper(file, encoding="utf-8")
        reader = csv.reader(f)
        for line in reader:
            if len(line) > 0:
                arr_of_values = line[0].split(';')
                arr_of_values = [x.replace('"', "`") for x in arr_of_values]
                cursor = connection.cursor()
                # print(arr_of_values)
                query = (f'UPDATE {title}_champ ' +
                        f'SET DuelIsPlace = {str(arr_of_values[2])}, ' +
                            f'WinnerRed = {str(arr_of_values[3])}, ' +
                            f'WinnerWhite = {str(arr_of_values[6])} ' +
                        f'WHERE TatamiId = {str(arr_of_values[0])} ' +
                        f'AND NumDuel = {str(arr_of_values[1])}')
                cursor.execute(query)

                query = (f'SELECT AthIdRed FROM {title}_champ ' +
                        f'WHERE TatamiId = {str(arr_of_values[0])} ' +
                        f'AND NumDuel = {str(arr_of_values[1])}')
                cursor.execute(query)
                red = cursor.fetchall()[0][0]

                query = (f'SELECT AthIdWhite FROM {title}_champ ' +
                        f'WHERE TatamiId = {str(arr_of_values[0])} ' +
                        f'AND NumDuel = {str(arr_of_values[1])}')
                cursor.execute(query)
                white = cursor.fetchall()[0][0]

                query = (f'UPDATE {title}_athchamp ' +
                        f'SET CountWinner = {str(arr_of_values[4])}, ' +
                            f'CountBall = {str(arr_of_values[5])} ' +
                            f'WHERE athId = {str(red)}')
                cursor.execute(query)

                query = (f'UPDATE {title}_athchamp ' +
                        f'SET CountWinner = {str(arr_of_values[7])}, ' +
                            f'CountBall = {str(arr_of_values[8])} ' +
                            f'WHERE athId = {str(white)}')
                cursor.execute(query)

    return HttpResponse(status=200)


@csrf_exempt
def Result_PNG_Tournament(request):
    if request.method == 'POST':

        file = request.FILES.get('file')
        title = request.POST.get('Title').lower()

        if file is None:
            HttpResponse(status=400)
        try:
            zipF = ZipFile(file, 'r')
            zipF.extractall('media/results/' + title)
        except:
            return HttpResponse(status=400)

    return HttpResponse(status=201)
    # if request.method == 'POST':
    #     person = request.FILES.get('ResultPerson')
    #     club = request.FILES.get('ResultClub')
    #     coach = request.FILES.get('ResultCoach')
    #     country = request.FILES.get('ResultCountry')
    #     scool = request.FILES.get('ResultScool')
    #     names_dict = {0: 'ResultPerson.svg', 1: 'ResultClub.svg',
    #                   2: 'ResultCoach.svg', 3: 'ResultCountry.svg', 4: 'ResultScool.svg'}
    #     cnt = 0
    #     for file in [person, club, coach, country, scool]:
    #         try:
    #             if file is not None:
    #                 with ZipFile(file, 'r') as zipF:
    #                     info_all = zipF.infolist()
    #                     zipF.extractall('media/results')
    #                     for info in info_all:
    #                         name = info.filename
    #                         try:
    #                             os.remove('media/results/' + names_dict[cnt])
    #                         except:
    #                             pass
    #                         os.rename('media/results/' + name, 'media/results/' + names_dict[cnt])
    #             cnt += 1
    #         except:
    #             return HttpResponse(status=400)

    # return HttpResponse(status=200)

# Move to controllers
def setTournamentTime(title, tatamiId, actualTime):
    try:
        isTatamiTime = getTatamiTime(title)

        if (isTatamiTime):
            cursor = connection.cursor()
            query = (f'SELECT Count(*) ' +
                    f'FROM {title}_tatami ' +
                    f'WHERE id = {tatamiId}')

            cursor.execute(query)

            tatamiRecordExists = cursor.fetchall()[0][0] > 0

            # print("tatamiRecordExists")
            # print(tatamiRecordExists)

            if (tatamiRecordExists) :
                query = (f'UPDATE {title}_tatami ' +
                    f'SET actualTime = {actualTime} ' +
                    f'WHERE id = {tatamiId}')
            else :
                query = (f'INSERT INTO {title}_tatami (id, url, actualTime) ' +
                    f'VALUES ({tatamiId}, "", {actualTime})')
                    # INSERT INTO table_name (column1, column2, column3, ...)
                    # VALUES (value1, value2, value3, ...);

        else:
            # TODO
            # TOCHECK
            # TOTEST
            # createTatamiTableQuery = (f"CREATE TABLE IF NOT EXISTS '{title}_tatami' (" +
            #                 "'id' int(11) NOT NULL," +
            #                 "'url' varchar(255) NOT NULL DEFAULT ''," +
            #                 "'actualTime' int(11) NOT NULL DEFAULT '0'" +
            #               ") ENGINE=InnoDB DEFAULT CHARSET=utf8;")

            # cursor.execute(createTatamiTableQuery)

            query = ('UPDATE champs ' +
                    'SET actualTime = ' + str(actualTime) + ' ' +
                    'WHERE title = "' + title + '"')

        cursor.execute(query)

    except Exception as e:
        print('EXCEPTION: ', e)
        return HttpResponse(e, status=400)





# Sets actualTime for each tatami
# or actualTime for champs record for actual champ
# depending on newness of tournament.
# Not called after tounament is finished.
@csrf_exempt
def setTournamentTimeRequest(request):
    if request.method == 'POST':
        title = request.POST.get('Title')
        title = title.replace(" ", "_").lower()
        tatamiId = request.POST['tatamiId']
        actualTime = request.POST['actualTime']

        setTournamentTime(title, tatamiId, actualTime)

    return HttpResponse(status=201)



@csrf_exempt
def generateTranslationsRequest(request):
    if request.method == 'GET':
        generateTranslations()

    return HttpResponse('ok', status=201)


def generateTranslations():
    cursor = connection.cursor()

    # TODO: Optimize? - retrieve only used countries
    cursor.execute('SELECT * FROM countries ')
    countries = tatami_one_fetch(cursor, None)

    cursor.execute('SELECT * FROM regions ')
    regions = tatami_one_fetch(cursor, None)

    # TODO: Optimize? - retrieve only shown champs
    cursor.execute('SELECT * FROM champs ')
    champs = tatami_one_fetch(cursor, None)

    langs = ['en', 'ru', 'ua']
    langsUpercased = ['En', 'Ru', 'Ua']
    langsExt = '.json'

    for i in range(len(langs)):
        countryJson = {}

        for country in countries:
            countryJson[country["countryId"]] = country["countryName" + langsUpercased[i]]

        regionJson = {}

        for region in regions:
            regionJson[region["regionId"]] = region["regionName" + langsUpercased[i]]

        champsJson = {}

        for champ in champs:
            champJson = {}

            try:
                query = (f'SELECT {champ["title"]}_category.CategoryName{langsUpercased[i]}, categoryId ' +
                        f' FROM {champ["title"]}_category')
                cursor.execute(query)
                categories = tatami_one_fetch(cursor, None)


                categoriesJson = {}

                for category in categories:
                    categoriesJson[category["categoryId"]] = category["CategoryName" + langsUpercased[i]]

                champJson["categories"] = categoriesJson
            except:
                pass

            champJson["champInfo"] = champ["champInfo" + langsUpercased[i]]
            champJson["address"] = champ["address" + langsUpercased[i]]

            champWrapper = {}
            champWrapper["champ"] = champJson

            fileName = settings.APP_I18N_LOCATION + 'champs/' + champ["title"].lower() + '-' + langs[i] + langsExt

            with open(fileName, "w", encoding="utf-8") as openedFile:
                json.dump(champWrapper, openedFile, ensure_ascii=False, indent=4, separators=(',',': '))

            openedFile.close()



            champsJson[champ["title"].lower()] = {
                "name": champ["champName" + langsUpercased[i]],
                "city": champ["champCity" + langsUpercased[i]],
                # "categories": categoriesJson
            }

            fileName = settings.APP_I18N_LOCATION + langs[i] + langsExt

            with open(fileName, encoding="utf-8") as openedFile:
                i18nJson = json.load(openedFile)

            openedFile.close()

            i18nJson["db"] = {
                "country" : countryJson,
                "region" : regionJson,
                "champs": champsJson
            }

            # i18nJson=i18nJson.decode(encoding='utf-8')
            with open(fileName, "w", encoding="utf-8") as openedFile:
                json.dump(i18nJson, openedFile, ensure_ascii=False, indent=4, separators=(',',': '))
            openedFile.close()

        # except Exception as e:
        #     print('EXCEPTION: ', e)
        #     return HttpResponse(e, status=400)

