var AsyncLock = require("async-lock");
var lock = new AsyncLock({ maxPending: 2 });

const query = async (pool, query, callback) => {
   lock.acquire("elephantsql", async () => {
      //   const client = await pool.connect();
      try {
         return pool.query(query, (err, res) => {
            if (err) {
               console.log(err);
            } else {
               if (callback) callback(err, res);
            }
         });
      } finally {
         //  await client.release();
         //  await client.end();
      }
   });
};

module.exports = { query };
