var jobs = {};

module.exports = {
    RegisterJob(name, func, intervalTime) {
        if (jobs[name] != null) {
            throw ("Job " + name + " is already registered");
        }
        else {
            // Activate job and save the interval id on dictionary.
            jobs[name] = setInterval(func, intervalTime);
        }
    },

    CancelJob(name) {
        var jobId = jobs[name];

        if (jobId != null) {
            clearInterval(jobId);
        }
    }
}