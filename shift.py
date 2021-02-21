# ver 1.00
import sys
import os

def gettime(strt):
    #print(strt)
    #print(''+strt[:1] + ' ' + strt[2:4] + ' ' +strt[5:7] + ' ' + strt[8:11])
    t = int(strt[:1])*60*60*1000 + int(strt[2:4])*60*1000 +int(strt[5:7])*1000 +int(strt[8:11])
    #print(t)
    return t

def timestr(time):
    tstr = "" + str(int(time / 3600 / 1000))+":"+str(int(time%3600000 / 60 / 1000)).zfill(2)+":"+str(int(time%60000 /1000)).zfill(2)+"."+str(int(time%1000)).zfill(3)
    #print("tstr:" + tstr)
    return tstr


print('Usage: shift.py <sbv file> <millisecs to shift> [<from this text block (end timestamp of last, not shifted text block)>]')
ts = int(sys.argv[2])
if (len(sys.argv)>3):
    after = sys.argv[3]
    checkAfter = True
else:
    checkAfter = False

weAreAfter = False
print('sbv file:' + sys.argv[1])
print('Result file: '+ sys.argv[1].replace(".sbv", "")+'_shift.sbv')
print('Shift by: ' + str(ts) + " ms")
if (checkAfter):
    print('From : ' + after + ' finished text block.')

if (not os.path.isfile(sys.argv[1])):
    print('Input file not found.')
    sys.exit()
num = 0

with open(sys.argv[1], encoding='utf-8') as inf:
    with open(sys.argv[1].replace(".sbv", "")+'_shift.sbv', 'wb') as of:
        lines = inf.readlines()
        i = 0
        while(i<len(lines)):
            #print(lines[i])
            if (lines[i][:2]=="0:"):
                if (not checkAfter or weAreAfter):
                    t = gettime(lines[i][:11])
                    t1 = gettime(lines[i][12:23])
                    newtstr = timestr(t+ts)
                    newtstr1 = timestr(t1+ts)
                    #print(newtstr + "," + newtstr1)
                    timestamp =newtstr + "," + newtstr1 + "\n"
                    of.write(timestamp.encode('utf8'))
                    num = num + 1
                else:
                    of.write(lines[i].encode('utf8'))
                    if (checkAfter):
                        if (after==lines[i][12:23]):
                            weAreAfter = True
            else:
                of.write(lines[i].encode('utf8'))
            i = i + 1
print('Ready. Shifted ' + str(num) + ' text blocks.')