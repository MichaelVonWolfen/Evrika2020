# Evrika 2020 - Finala

## Migratii

`$ node_modules/.bin/sequelize db:create - Creaza baza de date`

`$ node_modules/.bin/sequelize db:migrate - Creeaza tabelele in DB`

`$ node_modules/.bin/sequelize db:migrate:undo:all - Anuleaza toate migratiile facute in DB`

`$ node_modules/.bin/sequelize model:create --name teams --attributes numecol1:tip_date, numecol2:tip_date,...
`

`$ node_modules/.bin/sequelize migration:generate nume_migratie` - Creaza o migratie care are ca si nume 'nume_migratie'
