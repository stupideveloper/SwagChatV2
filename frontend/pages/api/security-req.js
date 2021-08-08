// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default (req, res) => {
	var e
	var parsedarray = {}
	var test
	console.log(req._parsedUrl.query)
	e = req._parsedUrl.query
	var array = e.split(/[&]/)
	array.forEach((thing)=>{
		test = thing.split(/[=]/)
		parsedarray[test[0]] = test[1]
	})
	console.log(parsedarray)
	res.status(200).json(parsedarray)
}
