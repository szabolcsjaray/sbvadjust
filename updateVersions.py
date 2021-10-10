# update versions for sources - program by Szabolcs Jaray 2021
import subprocess
import sys

mainFile = "sbvadjust.html"
files = []

def getCommandResult(command):
    res = subprocess.run(command, stdout=subprocess.PIPE)
    resStr = res.stdout.decode('utf-8')
    #print(resStr)
    resA = resStr.splitlines()
    return resA

def searchLine(lines, line):
    try:
        foundIndex = lines.index(line)
        print(foundIndex)
    except:
        print("not found: "+line)
        return False
    print("Found.")
    return True

def getVersion(line, extension):
    if (extension=="js"):
        return line[2:].strip()
    if (extension=="html" or extension=="css"):
        words = line.split(' ')
        return words[1]
    return ""

def validVersion(version):
    if (version.count('.')!=1):
        print('No dot.')
        return False
    if (version.find('.')==0 or version.find('.')==len(version)-1):
        print('Dot wrong pos.')
        return False
    for c in version:
        if (c!='.' and (c<'0' and c>'9')):
            print('invalid char.')
            return False
    print("version good")
    return True

def getVersionFromStr(str):
    a = int(str[0:str.find('.')])
    print("Major v:", a)
    b = int(str[str.find('.')+1:])
    print("Minor v:", b)
    return [a,b]

def createNewVersionLine(versionStr, extension):
    if (extension=="js"):
        return "// "+versionStr
    if (extension=="html"):
        return "<!-- "+versionStr+" -->"
    if  (extension=="css"):
        return "/* "+versionStr+" */"
    print("Unknown extension: "+extension + " . Please do your work, you lazy developer! :)")
    sys.exit()


def makeNewFile(fileName, lines, versionStr, extension):
    print("Writing to new file: "+ fileName+".new")
    with open(fileName, "wt") as newFile:
        versionLine = createNewVersionLine(versionStr, extension)
        newFile.write(versionLine)
        newFile.write("\n")
        first = True
        for line in lines:
            if(not first):
                newFile.write(line)
            else:
                first = False


def processVersionLine(fileName):
    global files
    with open(fileName) as sf:
        lines = sf.readlines()
        firstLine = lines[0][0:-1]
        pos = fileName.rfind('.')
        extension = fileName[pos+1:]
        diffLines = getCommandResult(['git', 'diff', fileName])
        modified = searchLine(diffLines, '+'+firstLine)
        ver = getVersion(firstLine, extension)
        if (not validVersion(ver)):
            print("version not valid in " + fileName + " .")
            sys.exit()
        print(ver)
        versions = getVersionFromStr(ver)

        if (not modified):
            newMinor = str(versions[1]+1).zfill(2)
            newVersionStr = str(versions[0])+'.'+newMinor
            print("New version for "+fileName+": "+newVersionStr)
            makeNewFile(fileName, lines, newVersionStr, extension)
            files.appens(fileName, newVersionStr)
        else:
            files.append([fileName, ver])

def changeMainFile():
    global files
    print(files)
    with open(mainFile) as mf:
        lines = mf.readlines()
    with open('newhtml.html', "wt") as nf:
        for l in lines:
            changed = False
            for f in files:
                if (l.find(f[0])!=-1):
                    if (l.find(f[1])==-1):
                        start = l.find("?v=")
                        if (start==-1):
                            print("Invalid include line in main file " + mainFile + ":\n "+l)
                            continue
                        end = l.find("\"", start)
                        if (end==-1):
                            print("Invalid include line in main file " + mainFile + ":\n "+l)
                            continue
                        newL = l[0:start+3] + f[1] + l[end:]
                        print("Line changed:\n" + l + "\n to:\n" + newL)
                        nf.write(newL)
                        changed = True
                        break
            if (not changed):
                nf.write(l)

def readFiles():
    global files
    resA = getCommandResult(['git', 'status'])
    for l in resA:
        try:
            ind = l.index('modified:')
            lw = l.strip().split("   ")
            print(lw[1])
            processVersionLine(lw[1])
            changeMainFile()
        except:
            print(".", end ="")



if __name__ == '__main__':
    readFiles()
