package main

import(
    "github.com/gorilla/mux"
    "net/http"
    "net/http/httputil"
    "fmt"
    "log"
	"local/user/redis_back"
	"github.com/mikespook/gearman-go/client"
	//"local/user/jotform_api"
)

func main() {
    r := mux.NewRouter()
    r.HandleFunc("/goback/addBackupTasks",addBackupTasks)
    http.Handle("/", r)


    /*
    japi := new(jotform_api.Jotform_api)
    japi.Init()
    _ = japi.GetForms() */
    fmt.Println("test2")
    http.ListenAndServe(":8080", nil)

}

func addBackupTasks(w http.ResponseWriter, r *http.Request){
	//redis := new(redis_back.RedisBack)
	//redis.Init()

	//let put redis aside for now! just stick with gearman 
	r.ParseForm()
	tasks  := r.FormValue("tasks")

	fmt.Println("header => ",r.Header)
	fmt.Println("tasks => ",tasks)
	fmt.Println("hello world in addBackupTasks")

	//read request body
	var p []byte;
	p,_ = httputil.DumpRequest(r,true)
	fmt.Println("READ BODY ",string(p))
	c, _ := client.New("127.0.0.1:4730")
	// ...
	defer c.Close()
	data := []byte("JOB 1")
	c.ErrHandler = func(e error) {
	    log.Println(e)
	    panic(e)
	}

	jobHandler := func(job *client.Job) {
	    log.Printf("%s", job.Data)
	}

	_ = c.Do("backupForm", data, client.JOB_NORMAL, jobHandler)
	fmt.Println("Tasks added")
		

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
