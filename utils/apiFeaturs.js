class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        // 1) filtering
        const copyQuery = { ...this.queryString };
        const execludedFields = ["page", "sort", "limit", "fields"];
        execludedFields.forEach(el => delete copyQuery[el]);

        // 2) advanced filtering
        const queryStr = JSON.stringify(copyQuery);
        const queryStr2 = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        this.query.find(JSON.parse(queryStr2))
        return this
    }

    sort() {
        if (this.queryString.sort) {
            let sortby = this.queryString.sort.replaceAll(",", " ")
            this.query = this.query.sort(sortby)
        } else {
            this.query = this.query.sort("-createdAt");
        }
        return this
    }

    limit() {
        if (this.queryString.fields) {
            let fields = this.queryString.fields.replaceAll(",", " ")
            fields = fields+ " -_id"
            this.query = this.query.select(fields)
        } else {
            this.query = this.query.select("-__v")
        }
        return this
    }

    paginate() {
        const page = this.queryString.page * 1 || 1
        const limit = this.queryString.limit * 1 || 100
        const skip = (page - 1) * limit
        this.query = this.query.skip(skip).limit(limit)
        // to check the number of page 

    }
}

module.exports = APIFeatures