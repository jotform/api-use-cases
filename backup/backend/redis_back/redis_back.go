package redis_back

import(
	"log"
	"github.com/alphazero/Go-Redis"
)

const(
	db_number = 13 //redis db number
	db_password = "redis_tmp_pass" //redis db password
)

//handler that will hold reference to redis client

type RedisBack struct{
	handler redis.Client
}

/*
	When called this function initializes the redis connection and set handler variable
*/
func (v *RedisBack) Init(){
	spec := redis.DefaultSpec().Db(db_number).Password(db_password)
	var e redis.Error
	v.handler, e = redis.NewSynchClientWithSpec(spec)
	if e != nil {
		log.Println("failed to create the client", e)
		return
	}
}
/*
	Todo make this functions work on some package struct
*/
func (v *RedisBack) Get(key string) (result []byte,err redis.Error){
	result, err = v.handler.Get(key)
	return
}

func (v *RedisBack)  Set(key string, value string) (err redis.Error){
	newval:= []byte(value)
	err = v.handler.Set(key, newval)
	return
}

