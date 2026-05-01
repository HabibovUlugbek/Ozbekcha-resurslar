FROM node:lts-slim
WORKDIR /app

#Load balancerni faylni yuklab olish
COPY load-balancer.js ./

#Default port belgilash(env bilan o`zgartirish mumkin)
ENV PORT=3000

# Load balancer ishga tushurish
CMD ["node", "load-balancer.js"]