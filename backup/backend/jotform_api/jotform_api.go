/*
	Package jotform_api is wrapper around jotform go api wrapper

	it supplies convenience functions for getting data out of jotform api
	
*/
package jotform_api

import(
	"github.com/jotform/jotform-api-go"
	"fmt"
	"strconv"
)

type Jotform_api struct{
	Client *jotform.JotformAPIClient
}

//initalizes the Jotform_api struct with correct details
func (ja *Jotform_api) Init(apikey string){
	ja.Client = new(jotform.JotformAPIClient)
	ja.Client.ApiKey = apikey
}

func (ja *Jotform_api) GetForms() (forms []byte) {
	forms = ja.Client.GetForms()
	//debug
	fmt.Println("Forms JSON = "+string(forms))
	return
}

func (ja *Jotform_api) GetFormQuestions(formId string) (questions []byte) {
	formid64,_ := strconv.ParseInt(formId,10,64)
	questions = ja.Client.GetFormQuestions(formid64 )
	return
}