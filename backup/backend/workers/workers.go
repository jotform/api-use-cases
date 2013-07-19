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
    
    go backFormAsync(job)
    return []byte("JOB RECEIVED"),nil
}
/*
    asyn version of backForm, does not return anything
*/
func backFormAsync(job *worker.Job){
      
    data := job.Data

    log.Println("backupFormAsync function entered")

    //fetch form questions from jotform
    //first unmarshal job.Data string
    jj := new(definitions.GearTask)

    json.Unmarshal(data,&jj)
    
    log.Println("JOB Received by me task ID => ",jj.TaskId)
    //get forms questions
    //questions := jotformAPI.GetFormQuestions(formidint64)
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
    w.AddFunc("backupForm", backupForm, worker.OneByOne)
    w.AddFunc("backupSubmissions", backupSubmissions, worker.OneByOne)
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
