import sys

processedWords = 0
blocks = []
content = []
blockLines = []
blockLineI = 0
logf = 0

def writeblock(resf, block):
    resf.write(block['timeLine'])
    resf.write("\n")
    resf.write(block['textLine'].encode('utf-8'))
    resf.write("\n\n")



def readBlock(subf):
    global blockLines
    global blockLineI

    if (blockLineI>=len(blockLines)):
        return {'timeLine': "NO_MORE_BLOCKS", 'textLine' : ""}

    sline = blockLines[blockLineI].strip()
    while (blockLineI<len(blockLines) and len(sline)==0):
        blockLineI = blockLineI + 1
        sline = blockLines[blockLineI].strip()

    if (blockLineI>len(blockLines)):
        return {'timeLine': "NO_MORE_BLOCKS", 'textLine' : ""}

    timeLine = sline
    blockLineI = blockLineI + 1
    if (blockLineI>=len(blockLines)):
        return {'timeLine': "NO_MORE_BLOCKS", 'textLine' : ""}

    nextLine = blockLines[blockLineI].strip()

    textLine = ""
    separator = ""
    while (blockLineI<len(blockLines) and len(nextLine)>1):
        textLine = textLine + separator + nextLine
        separator = " "
        blockLineI = blockLineI + 1
        if (blockLineI<len(blockLines)):
            nextLine = blockLines[blockLineI].strip()
    if (len(textLine)==0):
        return {'timeLine': "NO_MORE_BLOCKS", 'textLine' : ""}

    block = { 'timeLine': timeLine, 'textLine' : textLine }
    #print("timeLine:" + timeLine)
    #print("textLine:" + textLine)
    #print("-------------------------------------")
    return block

def readBlocks(subf):
    global blocks
    global blockLines

    blockLines = subf.readlines()

    block = readBlock(subf)
    while (len(block['textLine'])>3):
        if (block['timeLine']!="NO_MORE_BLOCKS"):
            blocks.append(block)
            block = readBlock(subf)
        else:
            print("NO MORE BLOCKS")
            break

def readContent(contf):
    global content

    lines = contf.readlines()
    content = []
    for line in lines:
        content.extend(line.strip().split());


def readNextWord():
    global processedWords
    global content

    if (processedWords<len(content)):
        processedWords = processedWords + 1
        return content[processedWords - 1].decode('utf-8')
    else:
        return "END_OF_WORDS"


EXACT_MATCH = 1
PARTIAL_MATCH = 2
DIFFERENT = 3

def matches(word1, word2):
    if (word1.upper()==word2.upper()):
        return EXACT_MATCH
    else:
        dword1 = word1.upper()
        dword2 = word2.upper()
        i = 0
        diff = []
        #print("match:" + dword1 +"|"+ dword2)
        while (i<len(dword1) and i<len(dword2)):
            if (dword1[i]!=dword2[i]):
                diff.append(i)

            i = i + 1
        #print(diff)



        if (len(dword1)==len(dword2)+1):
            if (i==len(dword2) and len(diff)==0):
                return PARTIAL_MATCH

        if (len(dword2)==len(dword1)+1):
            if (i==len(dword1) and len(diff)==0):
                return PARTIAL_MATCH

        if (len(diff)==1 and i>2):
            return PARTIAL_MATCH


        if (len(dword1)>len(dword2)):
            if (len(dword1)>len(dword2)+4):
                return DIFFERENT
            if (len(diff)==1 and diff[0]==len(dword2)-1):
                return PARTIAL_MATCH
        elif (len(dword2)>len(dword1) and len(dword1)>2):
            if (len(dword2)>len(dword1)+4):
                return DIFFERENT
            if (len(diff)==1 and diff[0]==len(dword1)-1):
                return PARTIAL_MATCH
        elif (len(diff)==1 and diff[0]==len(dword1)-1 and len(dword1)>2):
            return PARTIAL_MATCH

        if (i>2 and len(diff)<len(dword1)*0.3 and len(diff)<len(dword2)*0.3):
            return PARTIAL_MATCH

        return DIFFERENT

LOOK_FORWARD = 5

def processBlock(block):
    global processedWords
    global content
    global logf

    resTextLine = ""
    separator = ""
    print("Processing block: " + block['timeLine'])
    blockWords = block['textLine'].split()
    blockWordI = 0
    startWord = processedWords
    iLog = "Processing block: " + block['timeLine'] + "\n"
    while (blockWordI<len(blockWords)):
        blockWord = blockWords[blockWordI]
        nextWord = readNextWord()
        iLog = iLog + "Check block|content: " + blockWord + "|" + nextWord + "\n"
        #print("Check block|content: " + blockWord + "|" + nextWord)
        match = matches(nextWord, blockWord)
        if (match==EXACT_MATCH):
            resTextLine = resTextLine + separator + nextWord
            iLog = iLog + "Exact match (block|content): " + blockWord + "|" + nextWord + "\n"
            #print("Exact match (block|content): " + blockWord + "|" + nextWord)
        elif (match==PARTIAL_MATCH):
            iLog = iLog + "Partial match (block|content): " + blockWord + "|" + nextWord + "\n"
            #print("Partial match (block|content): " + blockWord + "|" + nextWord)
            resTextLine = resTextLine + separator + nextWord

        else:
            iLog = iLog + "Problem here (block|content):" + blockWord + "|" + nextWord + "\n"
            #print("Problem here (block|content):" + blockWord + "|" + nextWord)

            syncs = []
            badBlockWord = blockWord
            blockWordProblemI = blockWordI
            foundSync = False
            while (foundSync==False and blockWordI<len(blockWords) and blockWordI-blockWordProblemI<LOOK_FORWARD):
                blockWord = blockWords[blockWordI]
                iLog = iLog + "Try to find sync for this block word:" + blockWord +"\n"
                #print("Try to find sync for this block word:" + blockWord)
                findI = processedWords-1
                collectContentPart = ""
                while (findI<processedWords+LOOK_FORWARD and (matches(content[findI].decode('utf-8'), blockWord)==DIFFERENT)):
                    iLog = iLog +  "Try sync, no match:" + content[findI].decode('utf-8') + "!=" + blockWord + "\n"
                    #print("Try sync, no match:" + content[findI].decode('utf-8') + "!=" + blockWord)
                    collectContentPart = collectContentPart + separator + content[findI].decode('utf-8')
                    separator = " "
                    findI = findI + 1
                if (findI>=processedWords+LOOK_FORWARD):
                    blockWordI = blockWordI + 1
                    iLog = iLog + "Step blockWordI"  + "\n"
                    #print("Step blockWordI")
                else:
                    iLog = iLog + "Found sync: " + content[findI].decode('utf-8')  + "==" + blockWord.decode('utf-8')  + "\n"
                    #print("Found sync: " + content[findI].decode('utf-8')  + "==" + blockWord.decode('utf-8'))
                    collectContentPart = collectContentPart + separator + content[findI].decode('utf-8')
                    sync = {'findI': findI, 'blockWordI' : blockWordI, 'collectContentPart': collectContentPart}
                    syncs.append(sync)
                    blockWordI = blockWordI + 1

                    #foundSync = True

            if (len(syncs)==0):
                print(iLog)
                print("Not found sync till end of block or 20 words, word:" + nextWord + ", block word:" + badBlockWord +". Block is:" + block['timeLine'])
                print("Old block:" + block['textLine'])
                i = processedWords
                contentFrom = ""
                while (i<processedWords+10 and i<len(content)):
                    contentFrom = contentFrom + content[i] + " "
                    i = i + 1
                print("Content from:" + contentFrom)
                sys.exit()
            else:
                #print("Syncs num: " , len(syncs))
                if (len(syncs)!=1):
                    #print("Sync only: --------")
                    #for k,v in sync.iteritems():
                    #    print(k , v)
                    #print("----------")
                #else:
                    firstSync = syncs[0]

                    for i in range(1, len(syncs)):
                        sync = syncs[i]
                        if (firstSync['findI']==sync['findI']+1 and firstSync['blockWordI']==sync['blockWordI']+1):

                            #print("Sync: --------")
                            #for k,v in sync.iteritems():
                            #    print(k , v)
                            #print("----------")
                            sync = firstSync
                            break
                        else:
                            firstSync = sync
                processedWords = sync['findI'] + 1
                iLog = iLog + "Apply sync, add this to new block:" + sync['collectContentPart'] + "\n"
                resTextLine = resTextLine + sync['collectContentPart']
                blockWordI = sync['blockWordI']
                iLog = iLog + "result so far:" + resTextLine + "\n"
                if (blockWordI<len(blockWords)-1):
                    iLog = iLog + "next block word:" + blockWords[blockWordI+1] + "\n"
                logf.write(iLog.encode('utf-8') + "\n")
                logf.write("\n\n")
                #print("result so far:" + resTextLine)
        separator = " "
        blockWordI = blockWordI + 1

    print("New block text:" + resTextLine)
    print("Old block text:" + block['textLine'])
    if (len(resTextLine.split())!=len(block['textLine'].split())):
        print('------------------------------!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!---------------------------------------------')
    usedWords = ""
    for i in range(startWord, processedWords):
        usedWords = usedWords + content[i] + " "
    print("Used words    :" + usedWords)
    print("---------------------------------------------------")
    return {'timeLine' : block['timeLine'], 'textLine' : resTextLine}

def process(subf, contf, resf, fixf):
    global blocks
    global content

    readBlocks(subf)
    print("Number of caption blocks read:", len(blocks))
    readContent(contf)

    blockI = 0
    while (blockI<len(blocks)):
        newBlock = processBlock(blocks[blockI])
        writeblock(resf, newBlock)
        blockI = blockI + 1



def parameters():
    global logf

    if len(sys.argv)<3 or sys.argv[1]==sys.argv[2]:
        print("Usage: python " + sys.argv[0] + " <subtitle file name> <content text file name>")
        print('   subtitle file and content file must be different!')
        sys.exit()

    logf = open("process.log", "w")
    with open(sys.argv[1]) as subf:
        with open(sys.argv[2]) as contf:
            with open('results.sbv', 'w') as resf:
                with open('fixes.txt', 'w') as fixf:
                    print("SbvAdjust\n Subtitle file: " + sys.argv[1])
                    print(" Content file: " + sys.argv[2])
                    print(" Result SBV file: result.sbv")
                    process(subf, contf, resf, fixf)


if __name__ == '__main__':
    parameters()
    """

    strs = u"As always, there has been a lot going on in the space industry lately and thanks to 1400 votes, so let's dive right in!".decode('utf-8')
    strsparts = strs.split()
    content = strsparts
    block={"timeLine": "0000", "textLine" : "And as always, there has been a lot going on in the space industry lately and thanks to 1400 votes. Let's dive right in!"}
    processedWords= 0
    processBlock(block)
    """