FROM ubuntu:latest

# Copy files
COPY ./ /

# Install packages
RUN npm install

#ENTRYPOINT ["/index.ts"]
CMD ["ts-node", "index.ts"]
 
