from django.urls import path
from apiPost.views import *

urlpatterns = [
    path('api-champ-set-clubs', Clubs_File),                    # insert clubs taking place in champ
    path('api-champ-set-coaches', Coach_File),                  # insert coaches taking place in champ
    path('api-champ-set-champt', Champ_File),                    # insert info about duels
    path('api-champ-update-tatami-champt', updateTatamiChampt),
    path('api-champ-set-category', Category_File),              # set categories
    # path('api-champ-set-tatami', Tatami_File),                  # insert tatami's info
    path('api-champ-set-tournament-time', setTournamentTimeRequest),
    path('api-champ-set-participants', Participants_File),      # insert athletes taking place in champ
    path('api-champ-set-all_champ', All_File_Champ),            # set all previous params in one request
    path('api-champ-set-params', Params_Page),                  # set params about champ
    path('api-champ-set-athlete-photos', Photo_Participant),    # insert athlete's photos
    path('api-champ-set-draw-png', File_PNG_Category),          # draw by categories ( svg )
    path('api-champ-set-ath-final', Set_Ath_Final),             # set winners from category ( by Id )
    path('api-champ-set-duel-tatami', Set_Duel_Tatami),         # set info about duel that already passed
    path('api-champ-set-results', Result_PNG_Tournament),       # insert 5 files contains results
    path('api-champ-set-custom-clubs', Clubs_Custom_File),                    # insert clubs taking place in champ
    path('api-champ-set-custom-coaches', Coach_Custom_File),                  # insert coaches taking place in champ
    path('api-champ-set-custom-participants', Participants_Custom_File),      # insert athletes taking place in champ
    path('api-champ-set-table-kata', Table_Kata_File),          # insert kata taking place in champ
    path('api-champ-set-table-kata-group', Table_KataGroup_File),  # insert kata-group taking place in champ
    path('i18n', generateTranslationsRequest),

]
