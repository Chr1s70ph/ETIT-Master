FROM node:16.8.0

# Copy files
COPY ./ /

# Install packages
RUN npm install

#ENTRYPOINT ["/index.ts"]
CMD ["ts-node", "index.ts"]
 
