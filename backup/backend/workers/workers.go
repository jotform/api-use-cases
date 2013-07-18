package main

import (
    "os"
    "log"
    "local/user/signal"
    "github.com/mikespook/gearman-go/worker"
    "local/user/redis_back"
    "github.com/jotform/jotform-api-go"
    "encoding/json"
    "local/user/definitions"
    "strconv"
)

func backupForm(job *worker.Job) ([]byte, error) {
    
    
    data := job.Data

    log.Println("backupForm function entered")

    //fetch form questions from jotform
    //first unmarshal job.Data string
    jj := new(definitions.GearTask)

    json.Unmarshal(data,&jj)
    
    //cal async version to do job in backgroudn
    //go backFormAsyn(job)
    log.Println("JOB Received by me task ID => ",jj.TaskId)
    return []byte("JOB RECEIVED"),nil
}
/*
    asyn version of backForm,
*/
func backFormAsyn(job *worker.Job)([]byte,error){
      
    data := job.Data

    log.Println("backupForm function entered")

    //fetch form questions from jotform
    //first unmarshal job.Data string
    jj := new(definitions.GearTask)

    json.Unmarshal(data,&jj)
    
    jotformAPI := new(jotform.JotformAPIClient)
    jotformAPI.ApiKey = jj.ApiKey
    formidint64,_ := strconv.ParseInt(jj.FormId,10,64)
    //get forms questions
    questions := jotformAPI.GetFormQuestions(formidint64)
    log.Println("received questions => ",string(questions))

    return nil,nil
}

func backupSubmissions(job *worker.Job)([]byte, error){
    
    return nil,nil
}



func main() {
    log.Println("Starting ...")
    defer log.Println("Shutdown complete!")
    w := worker.New(worker.Unlimited)
    defer w.Close()
    w.ErrHandler = func(e error) {
        log.Println("an error occured ErrHandler")
        log.Println(e)
        if e == worker.ErrConnection {
            proc, err := os.FindProcess(os.Getpid())
            if err != nil {
                log.Println(err)
            }
            if err := proc.Signal(os.Interrupt); err != nil {
                log.Println(err)
            }
        }
    }
    w.AddServer("127.0.0.1:4730")
    w.AddFunc("backupForm", backupForm, worker.Immediately)
    w.AddFunc("backupSubmissions", backupSubmissions, worker.Immediately)
    w.AddFunc("SysInfo", worker.SysInfo, worker.Immediately)
    w.AddFunc("MemInfo", worker.MemInfo, worker.Immediately)
    go w.Work()
    sh := signal.NewHandler()
    sh.Bind(os.Interrupt, func() bool {return true})
    sh.Loop()
}

/*
    dummy function for requirements implementation
*/
func dummy(){
        redis := new(redis_back.RedisBack)
        redis.Init()
        _,_ = strconv.ParseInt("asd",2,2)
        _ = new(jotform.JotformAPIClient)
}
