FROM node:lts-slim
WORKDIR /app

#Server faylni yuklab olish
COPY server.js ./

#Default port belgilash(env bilan o`zgartirish mumkin)
ENV PORT=3000

# Serverni ishga tushurish
CMD ["node", "server.js"]