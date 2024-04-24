from django.urls import path
from coachPage.views import *

urlpatterns = [
    path('api-champ-get-coach-athletes', GetCoachAth),                  # get all coach's athletes
    path('api-champ-get-athlete-info', GetAthInfo),                     # get info about current athlete
    path('api-champ-delete-ath-from-champ', DeleteAthFromChamp),        # delete athlete from current champ
    path('api-champ-clear-coach-ath-list', ClearListAth),               # delete all coach's athletes
    path('api-champ-delete-ath', DeleteAth),                            # delete athlete
    path('api-champ-insert-new-ath', InsertNewAth),                     # create new athlete ( global scope )
    path('api-champ-insert-ath-into-champ', InsertAthIntoChamp),        # insert athlete into champ ( local scope )
    path('api-champ-update-ath-info', UpdateAth),                       # insert updated params about athlete
    path('api-get-champ-info', GetChampInfo),
    path('api-get-current-valid-champ', GetCurrentValidChamp),
    path('api-get-valid-champ-with-title', GetCurrentValidChampWithTitle),
    path('api-get-all-branch', getAllBranchesReguesh),
    path('api-get-coaches-by-branch/<int:coachId>', getCoachesByBranchRequest),
    path('api-block-coache', BlockCoaches),
    path('api-change-role', changeRoleRequest),


    path('api-champ-delete-refery', DeleteRefery),                            # delete Refery
    path('api-champ-insert-new-refery', InsertNewRefery),                     # create new Refery ( global scope )
    path('api-champ-update-refery-info', UpdateRefery),                       # insert updated params about Refery
    path('api-champ-update-refery-brigade', UpdateReferyBrigade),                       # insert updated params about Refery

    path('api-champ-get-ath-list', GetAthList),
    path('api-all-coaches', GetAllCoaches),
    path('api-all-clubs', GetAllClubs),
    path('api-get-coaches-by-id/<int:coachId>', GetCoachById),
    path('api-update-coach', UpdateCoach),
    path('api-champ-set-all-kumite', setAllKumite),
    path('api-champ-set-all-kata', setAllKata),
    path('api-champ-is-exists-file', GetFileLogo),

]
