/*
	Package jotform_api is wrapper around jotform go api wrapper

	it supplies convenience functions for getting data out of jotform api
	
*/
package jotform_api

import(
	"github.com/jotform/jotform-api-go-old"
	"fmt"
)

type Jotform_api struct{
	Client *jotform.JotformAPIClient
}

//initalizes the Jotform_api struct with correct details
func (ja *Jotform_api) Init(){
	ja.Client = new(jotform.JotformAPIClient)
	ja.Client.ApiKey = "05f5108864eb5ee828ef9b7f8218b448"
}

func (ja *Jotform_api) GetForms() (forms []byte) {
	forms = ja.Client.GetForms()
	//debug
	fmt.Println("Forms JSON = "+string(forms))
	return
}