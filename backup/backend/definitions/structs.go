package definitions

type Task struct {
        FormTitle string
        Id      string
        SubmissionTasks [][]int
}

//gearman task struct
type GearTask struct{
        OpType string //form or submission
        FormId string //id of the form
        ApiKey string //jotform api key of the user
        ExtraData string //extra data of tasks, std value is empty string for case submissions it will be a range string ie, 51-100
        TaskId int //id of the task for debug purposes
}
