einmal aus führen 

# führe rs.initiate im mongo container aus
docker-compose exec mongo mongosh --eval "rs.initiate({_id: 'rs0', members:[{_id:0, host:'mongo:27017'}]})"

# prüfen
docker-compose exec mongo mongosh --eval "rs.status()"




## Troubleshooting
Wenn ein Fehler beim Erstellen der Activity auftritt, z.B.:
```
Message:
Invalid `prisma.activity.create()` invocation: Prisma needs to perform transactions, which requires your MongoDB server to be run as a replica set. https://pris.ly/d/mongodb-replica-set
Stack:
PrismaClientKnownRequestError: 
Invalid `prisma.activity.create()` invocation:
```

docker-compose up -d mongo


docker-compose exec mongo mongosh --eval "rs.initiate({_id: 'rs0', members:[{_id:0, host:'mongo:27017'}]})"


wenn prisma build failed dann exportiere die Trusted certificates von deimem browser und speichere sie ab
$env:NODE_EXTRA_CA_CERTS = 'C:\certs\trusted_certs.crt'
npm run build-prisma
# nach Erfolg:
Remove-Item Env:\NODE_EXTRA_CA_CERTS
$env:NODE_EXTRA_CA_CERTS = 'C:\certs\trusted_certs.crt'
docker compose up -d mongo

podman exec -it mongo mongosh --eval "rs.initiate({_id:'rs0', members:[{ _id:0, host:'127.0.0.1:27017'}]})"
