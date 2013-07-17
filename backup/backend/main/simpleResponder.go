package main

import(
    "github.com/gorilla/mux"
    "net/http"
    "io/ioutil"
    "fmt"
    "log"
	"local/user/redis_back"
	"local/user/definitions"
	"github.com/mikespook/gearman-go/client"
	"encoding/json"
	"sync"
	//"local/user/jotform_api"
)

//struct definitions for easy json decoding


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
	
	body, _ := ioutil.ReadAll(r.Body)

	var tasks []definitions.Task
	//fmt.Println("received tasks in raw format => " ,string(body))

	json.Unmarshal(body,&tasks)

	//connect gearman
	c, _ := client.New("127.0.0.1:4730")
	// ...
	defer c.Close()
	c.ErrHandler = func(e error) {
	    log.Println(e)
	    panic(e)
	}
	var wg sync.WaitGroup
	jobHandler := func(job *client.Job) {
	    wg.Done()
	}
	
	//lets create tasks
	for _,task := range tasks {

		type GearTask struct{
			OpType string //form or submission 
			FormId string //id of the form
			ApiKey string //jotform api key of the user
			ExtraData string //extra data of tasks, std value is empty string for case submissions it will be a range string ie, 51-100
		}
		//add backupForm Task  //example api key, TODO: receive jotform api key via cookie :)
		gtask := definitions.GearTask{
			"form",
			task.Id,
			"05f5108864eb5ee828ef9b7f8218b448",
			""}
		gtask_arr,_ := json.Marshal(gtask)	
		wg.Add(1)
		_ = c.Do("backupForm", gtask_arr, client.JOB_NORMAL, jobHandler)
		fmt.Println("backupForm tasks added for form id "+task.Id)
		//add backupSubmissons Task
		if(len(task.SubmissionTasks) != 0){
			for _,sub_range := range task.SubmissionTasks {
				gtask := definitions.GearTask{
					"submissions",
					task.Id,
					"05f5108864eb5ee828ef9b7f8218b448",
					string(sub_range[0])+"-"+string(sub_range[1])}
				_,_ = json.Marshal(gtask)
				//_ = c.Do("backupSubmissions", gtask_arr, client.JOB_NORMAL, jobHandler)
				fmt.Println("backupSubmissions task added for form id "+task.Id+" and for range "+string(sub_range[0])+"-"+string(sub_range[1]))
			}
		}

	}
	wg.Wait()
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
