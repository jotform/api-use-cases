import os, time
import requests
import threading

class DownloadThread(threading.Thread):
    """ A worker thread that takes directory names from a queue, finds all
        files in them recursively and reports the result.

        Input is done by placing directory names (as strings) into the
        Queue passed in dir_q.

        Output is done by placing tuples into the Queue passed in result_q.
        Each tuple is (thread name, dirname, [list of files]).

        Ask the thread to stop by calling its join() method.
    """
    def __init__(self, path, files, window):
        super(DownloadThread, self).__init__()
        self.path = path
        self.files = files
        self.window = window
        self.stoprequest = threading.Event()

    def downloadFile(self, path, df):

        r = requests.get(df['url'])
        if r.status_code == 200:
            with open(path + "/" + df['name'], 'wb') as f:
                for chunk in r.iter_content():
                    f.write(chunk)

    def run(self):
        # Run download files method
        fileCount = len(self.files)
        self.window.progressbar['maximum'] = fileCount

        for df in self.files:
            if not self.stoprequest.isSet():
                self.window.progress += 1
                self.window.progressbar.step(1)
                self.window.progressbar.update()

                self.window.statusText["text"] = "Downloading " + str(self.window.progress) + " of " + str(fileCount) + " : " + df['name'] + ".."
                self.window.statusText.update()

                print "Downloading file " + df['name'] + " to path " + self.path
                self.downloadFile(self.path, df)

            else:
                return

        self.window.statusText["text"] = "Download complete. All uploaded files should be downloaded now!"
        self.window.statusText.update()
            

    def join(self, timeout=None):
        self.stoprequest.set()
        super(DownloadThread, self).join(timeout)
