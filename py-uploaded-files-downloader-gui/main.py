from Tkinter import *

import ttk
import easygui

from downloadThread import DownloadThread

import sys
import os
from JotForm import JotformAPIClient
import time

class Application(Frame):

	def startDownload(self, d, files):
		# set cancel button
		self.initButton['text'] = "Cancel"
		self.initButton['command'] = self.cancelDownload
		self.initButton.pack(padx=5, pady=5)
		# init download thread
		window = self # to manipulate status text
		self.thread = DownloadThread(path=d, files=files, window=window)
		self.thread.start()

	def cancelDownload(self):

		self.initButton.pack_forget()
		self.statusText["text"] = "Cancelling..."
		self.statusText.update()
		# stop download thread
		self.thread.join()
		# bye bye!
		self.statusText["text"] = "Download cancelled. Bye!"
		self.statusText.update()
		time.sleep(2)
		self.master.destroy()
		sys.exit()				

	def createFolder(self):
		# Create folder
		self.statusText["text"] = "Getting list of files..."
		self.statusText.update()

		print("Getting list of files")
		files = self.jotform.get_form_files(self.formID)

		if len(files) == 0:
			easygui.msgbox(msg="Form has 0 uploads. Please choose a form with uploaded files.")
			self.getForms()
			return

		# Got the file list - check if form file folder exists
		formPath = "./downloads/" + str(self.formID) + "/"

		d = os.path.dirname(formPath)
		if not os.path.exists(d):
			print("Creating form download path...")
			os.makedirs(d)

		self.progress = 0

		if easygui.ccbox(msg="You have " + str(len(files)) + " files uploaded for your form. Would you like to download them all?"):

			self.startDownload(d, files)
		# else:
		# 	easygui.msgbox(msg="Download cancelled. Good bye!")
		# 	sys.exit(0)
		

	def askAPIKey(self):
		self.apiKey = easygui.enterbox(msg="Enter your JotForm API Key", title=self.title)
		self.jotform = JotformAPIClient(self.apiKey.strip())

		try:
			self.forms = self.jotform.get_forms()
		except:
			self.askAPIKey()

	def getForms(self):
		print "API Key : " + self.apiKey.get()
		self.jotform = JotformAPIClient(self.apiKey.get().strip())

		try:
			self.statusText["text"] = "Getting forms..."
			self.statusText.update()
			self.forms = self.jotform.get_forms()
			self.keyEntry.pack_forget()
			self.initButton.pack_forget()
		except Exception as e:
			print "Error: " + str(e)
			self.askAPIKey()

		formList = []
		for form in self.forms:
			item = form['id'] + " - " + form['title']
			item = item.encode('utf-8')
			formList.append(item)

		selection = easygui.choicebox(msg="Which form's uploads would you like to download?", title=self.title, choices=formList)
		self.formID = selection.split(" - ")[0]

		try:
			self.createFolder()
		except Exception as e:
			print("ERROR : " + str(e))
			easygui.msgbox(msg="Sorry, an error ocurred while creating form download folder : " + str(e), title=self.title)
			sys.exit(0)



	def createWidgets(self):
		
		# Convert the Image object into a TkPhoto 
		tkimage = PhotoImage(file="/home/spirit/logo.png")

		self.logo = ttk.Label(self, image=tkimage)
		self.logo.image = tkimage
		self.logo.pack()

		self.welcome     = ttk.Label(self, text="Welcome to JotForm Uploaded Files Downloader")
		self.welcome.pack(padx=5, pady=10)
		self.statusText = ttk.Label(self, text="Please enter your JotForm API Key to start")
		self.statusText.pack(padx=5, pady=5)
		self.keyEntry    = ttk.Entry(self, textvariable=self.apiKey)
		self.keyEntry.pack(padx=5, pady=5)
		self.initButton  = ttk.Button(self,text="Start", command=self.getForms)
		self.initButton.pack(padx=5, pady=5)

		self.progress = 0
		self.progressbar = ttk.Progressbar(mode="determinate")
		self.progressbar.pack(side="bottom", fill="x")

	def __init__(self, master=None):
		# vars
		self.title  = "JotForm"
		self.apiKey = StringVar()
		Frame.__init__(self, master)

		self.pack()
		self.createWidgets()


root = Tk()
root.title("JotForm")

# setup window dimensions and position
w = 480
h = 210
# get screen width and height
ws = root.winfo_screenwidth()
hs = root.winfo_screenheight()
# calculate position x, y
x = (ws/2) - (w/2)
y = (hs/2) - (h/2)

root.geometry('%dx%d+%d+%d' % (w, h, x, y))

app = Application(master=root)
app.mainloop()

try:
	root.destroy()
except:
	print "Application already destroyed"
	pass

