package main

import(
    "github.com/gorilla/mux"
    "net/http"
    "fmt"
	"local/user/redis_back"
	"local/user/jotform_api"
)

func main() {
    r := mux.NewRouter()
    r.HandleFunc("/", HomeHandler)
    http.Handle("/", r)
    fmt.Println("Hello world")
    japi := new(jotform_api.Jotform_api)
    japi.Init()
    _ = japi.GetForms()
    http.ListenAndServe(":8080", nil)

}

func HomeHandler(w http.ResponseWriter, r *http.Request){
		var returnHTML string = ""
		redis := new(redis_back.RedisBack)
		redis.Init()

		key  := "key1"

		//read key from get parameters
		newkey := r.FormValue("key")
		returnHTML += "Possible key is "+newkey+"<br />"
		if newkey != ""{
			key = newkey
			returnHTML += "key overwritten to "+key+"<br />"
		}
		
		

		returnHTML+= "reading key "+key+" <br />"
		value,e:=redis.Get(key)
		valuestr := string(value) //convert returned byte[] to string for later use
		if e != nil{
			returnHTML += "there is a problem reading from redis server"
		}


		if value == nil{
			returnHTML += "key not found setting it as tmpval <br />"
			//then set it 
			redis.Set(key,"tmpval")
			value,_=redis.Get(key)
			valuestr = string(value)
			returnHTML += "key was fetched after setting "+valuestr+"<br />"
		}
		returnHTML += "Final key value is "+valuestr+" <br />"

		//check headers test
		w.Header().Set("Content Type","text/html")
		headers:=w.Header() //this will return pointer to headers map in theory
		//print out headers
		for k, _ := range headers { 
			returnHTML += k+" => "+headers[k][0]+"\n";
		}
		



		valbyte:=[]byte(returnHTML)
		_,_ = w.Write(valbyte)

}
