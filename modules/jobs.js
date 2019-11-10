let jobs = {};

module.exports = {
    registerJob(name, func, intervalTime) {
        if (jobs[name] != null) {
            throw ("Job " + name + " is already registered");
        }
        else {
            // Activate job and save the interval id on dictionary.
            jobs[name] = setInterval(func, intervalTime);
        }
    },

    cancelJob(name) {
        let jobId = jobs[name];

        if (jobId != null) {
            clearInterval(jobId);
        }
    }
};