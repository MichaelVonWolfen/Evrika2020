## Migratii
`$ npm install - instalare pachete npm`

Se acceseaza ./config/config.json si se introduce un username si o parola pentru MySQL
`$ node_modules/.bin/sequelize db:create - Creaza baza de date`

`$ node_modules/.bin/sequelize db:migrate - Creeaza tabelele in DB`

Acum se pot rula scriptul de populare a DB si cel cu functii/proceduri

Userii admini au parola 'admin' si sunt: 

joe.admin@xyz.com
jane.admin@xyz.com

Userii participanti au parola 'user' si sunt:

joe@usa.com
jill@usa.com
trump@usa.com
melania@usa.com
 
Se pot accesa noi useri accesand /register, dar rolul de admin trebuie introdus din DB acesstora daca este nevoie

`$ npm run dev` - Porneste nodemon
