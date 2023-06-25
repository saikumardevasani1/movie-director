const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const filePath = path.join(__dirname, "moviesData.db");

const app = express();
app.use(express.json());

let database = null;
const initializeDBandServer = async () => {
  try {
    database = await open({
      filename: filePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB Error : ${error.message}`);
    process.exit(1);
  }
};

initializeDBandServer();

// API 1

const convertDataObjToResponsiveObj = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const allMoviesNamesQuery = `SELECT movie_name FROM movie;`;
  const allMoviesNamesArray = await database.all(allMoviesNamesQuery);
  const finalAllMoviesNamesArray = allMoviesNamesArray.map((eachItem) => {
    return convertDataObjToResponsiveObj(eachItem);
  });
  response.send(finalAllMoviesNamesArray);
});

// API 2

app.post("/movies/", async (request, response) => {
  const bodyObj = request.body;
  const { directorId, movieName, leadActor } = bodyObj;
  const postingMovieQuery = `INSERT INTO movie(director_id,movie_name,lead_actor) VALUES(${directorId},'${movieName}','${leadActor}');`;
  const postedNewMovieArray = await database.run(postingMovieQuery);
  response.send("Movie Successfully Added");
});

// API 3

const movieDetailsBasedOnId = (dataObj) => {
  return {
    movieId: dataObj.movie_id,
    directorId: dataObj.director_id,
    movieName: dataObj.movie_name,
    leadActor: dataObj.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getUpdatedMovieQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const getUpdatedMovieArray = await database.get(getUpdatedMovieQuery);
  const getFinalUpdatedMovieArray = movieDetailsBasedOnId(getUpdatedMovieArray);
  response.send(getFinalUpdatedMovieArray);
});

// API 4

app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieQuery = await `UPDATE 
            movie 
         SET 
            director_id = ${directorId},
            movie_name = '${movieName}',
            lead_actor = '${leadActor}'
         WHERE 
            movie_id = ${movieId};`;
  const updatesMovieArray = await database.get(updateMovieQuery);
  response.send("Movie Details Updated");
});

// API 5

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deletingMovieQuery = `DELETE FROM movie WHERE movie_id = ${movieId}`;
  const deletedMovieArray = await database.run(deletingMovieQuery);
  response.send("Movie Removed");
});

//API 6

const changingDirectorsDetails = (eachObj) => {
  return {
    directorId: eachObj.director_id,
    directorName: eachObj.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const directorsDetailsQuery = `SELECT * FROM director;`;
  const directorsDetailsArray = await database.all(directorsDetailsQuery);
  const directorsDetailsFinalArray = directorsDetailsArray.map((eachItem) => {
    return changingDirectorsDetails(eachItem);
  });
  response.send(directorsDetailsFinalArray);
});

//API 7

const changingDirNameVariable = (eachObj) => {
  return {
    movieName: eachObj.movie_name,
  };
};

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const directorsMovie = `SELECT movie_name FROM movie WHERE director_id = ${directorId}`;
  const directorsMovieArray = await database.all(directorsMovie);
  const finalDirectorsMovieArray = directorsMovieArray.map((eachItem) => {
    return changingDirNameVariable(eachItem);
  });
  response.send(finalDirectorsMovieArray);
});
