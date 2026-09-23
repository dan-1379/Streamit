# Project Overview

This project aims to emulate a streaming web application that allows you to watch TV shows and films. For this project, the application will not allow the user to play any content. Design inspiration was taken from the platforms Netflix and Amazon Prime, applying Jakob’s Law throughout the pages. 

The application presents many films and shows for you to choose from, allowing you to select media, which opens a content page containing further information about the media such as episodes, trailers, cast, and a “people also watched” section. 

The project will have the following screens: 
- Landing page 
- Sign in 
- Sign up 
- Home screen 
- Content page 

At a minimum, this application will have screens 1 – 5, with the additional page showing the media content depending on development time constraints.

# Live Preview
A live preview of the application can be found here: [Figma Design](https://www.figma.com/design/5fiueTDYjInPampt8bNAKV/Web-Frameworks-Project?node-id=87-218&t=u3FohKLf3weOhE0Z-1). Each page within the project contains a runnable prototype, allowing users to view the user flows. 

# Architecture Diagram
```mermaid
architecture-beta
    group db(cloud)[Movie Database]
    group app(cloud)[Application server]
    group fe(cloud)[Movies Front end]
 
    service mongo(database)[MongoDB - BSON] in db
    service mongoose(disk)[Mongoose - JSON] in db
    service node(server)[Node js and Express - JSON] in app
    service angular(internet)[Angular - JSON] in fe
 
    mongo:R -- L:mongoose
    mongoose:R -- L:node
    node:R -- L:angular
```
