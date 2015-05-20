### TODOs
| Filename | line # | TODO
|:------|:------:|:------
| routes/tokens.js | 46 | zmienić na sendValidationError i pomyśleć nad zmianą kodu
| routes/tokens.js | 57 | zmienić na sendValidationError i pomyśleć nad zmianą kodu
| routes/tokens.js | 72 | zmienić na sendValidationError i pomyśleć nad zmianą kodu
| actions/accounts/createProfileAdmin.js | 22 | zaślepka dla wysyłania telefonu smsem
| actions/accounts/createProfileAdmin.js | 52 | sprawdzić we wszystkich Project mających profileId takie samo jak dane czy istnieje rola tego użytkownika
| routes/users/profileAdmin.js | 34 | dodać obsługę USER type
| routes/users/profileAdmin.js | 52 | wysyłka smsa
| basic.js | 13 | spróbować zepsuć token tak by walidator bazy się odpalił, może z wysłaniem pustego tokena, albo bardzo długiego?
| profiles.js | 90 | testy dla innego typu usera że próbuje utworzyć profil
| users_profile_admin.js | 181 | test gdy profil jest nieaktywny to nie można dodać użytkownika. Najpierw funkcja blokowania profilu
| users_profile_admin.js | 182 | test dodania dla usera nie będącego adminem funkcji admina