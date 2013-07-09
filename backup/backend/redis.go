/*
	Package redis is a easy connector and wrapper for get and set operations
	
	after init method is called a connection to redis server was initalized and all get and set

	methods will use it

	@author: kemal <kemal@jotform.com>
	@copyleft: jotform :)
*/

package redis_back

import(
	"fmt"
	"github.com/alphazero/Go-Redis"
)

const(
	db_number = 13 //redis db number
	db_password = "redis_tmp_pass" //redis db password
)

//handler that will hold reference to redis client
handler Client
/*
	When called this function initializes the redis connection and set handler variable
*/
func Init(){
	spec := redis.DefaultSpec().Db(db_number).Password(db_password)
	handler, e := redis.NewSynchClientWithSpec(spec)
	if e != nil {
		log.Println("failed to create the client", e)
		return
	}
}
/*
	Todo make this functions work on some package struct
*/
func(key string) Get(result string,err Error){
	tmpresult, tmperr := handler.Get(key)
	err = tmperr
	result = string(tmpresult)
	return
}

func(key string, value string) Set(err Error){
	newval:= []byte(value)
	err = client.Set(key, newval)
	return
}

/*
	Temp function
*/
