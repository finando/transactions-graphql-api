#!/bin/sh
envsubst < ./prisma/.env.template > ./prisma/.env;
npm run serve:prod;
