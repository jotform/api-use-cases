package main

import (
		"github.com/alphazero/Go-Redis"
        "github.com/gorilla/mux"
        "net/http"
        "fmt"
        "bufio"
		"log"
		"os"
)

func main() {
    r := mux.NewRouter()
    r.HandleFunc("/", HomeHandler)
    http.Handle("/", r)
    fmt.Println("Hello world")
    http.ListenAndServe(":8080", nil)
}

func HomeHandler(w http.ResponseWriter, r *http.Request){
		spec := redis.DefaultSpec().Db(13).Password("go-redis")
		client, e := redis.NewSynchClientWithSpec(spec)
		if e != nil {
			log.Println("failed to create the client", e)
			return
		}

		key := "examples/hello/user.name"
		value, e := client.Get(key)
		if e != nil {
			log.Println("error on Get", e)
			return
		}

		if value == nil {
			fmt.Printf("\nHello, don't believe we've met before!\nYour name? ")
			reader := bufio.NewReader(os.Stdin)
			user, _ := reader.ReadString(byte('\n'))
			if len(user) > 1 {
				user = user[0 : len(user)-1]
				value = []byte(user)
				client.Set(key, value)
			} else {
				fmt.Printf("vafanculo!\n")
				return
			}
		}
		fmt.Printf("Hey, ciao %s!\n", fmt.Sprintf("%s", value))
        w.Write([]byte("asd"))
}
