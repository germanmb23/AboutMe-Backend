var AsyncLock = require("async-lock");
var lock = new AsyncLock({ maxPending: 4 });

const query = async (pool, query) => {
   lock.acquire("elephantsql", async () => {
      //   const client = await pool.connect();
      try {
         return pool.query(query, (err, res) => {
            if (err) console.log(err);
         });
      } finally {
         //  await client.release();
         //  await client.end();
      }
   });
};

module.exports = { query };
