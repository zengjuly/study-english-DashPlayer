import {useEffect, useState} from "react";
import useDpTask from "@/fronted/hooks/useDpTask";
import {DpTask, DpTaskState} from "@/backend/db/tables/dpTask";
import {AiAnalyseNewWordsRes} from "@/common/types/AiAnalyseNewWordsRes";
import {cn} from "@/fronted/lib/utils";
import {strBlank} from "@/common/utils/Util";

const api = window.electron;
const ChatLeftWords = ({sentence, className, updatePoint}: {
    sentence: string,
    className: string,
    updatePoint?: (p: string[]) => void
}) => {
    const [taskId, setTaskId] = useState<number>(null);
    const dpTask: DpTask | null = useDpTask(taskId, 100);
    useEffect(() => {
        const runEffect = async () => {
            const taskId = await api.aiAnalyzeNewWords(sentence);
            setTaskId(taskId);
        }
        runEffect();
    }, [sentence]);
    useEffect(() => {
        if (dpTask?.status === DpTaskState.DONE) {
            const res = strBlank(dpTask?.result) ? null : JSON.parse(dpTask?.result) as AiAnalyseNewWordsRes;
            if (res?.hasNewWord) {
                updatePoint(res.words.map(w => w.word));
            }
        }
    }, [dpTask?.result, dpTask?.status, updatePoint]);
    const res = strBlank(dpTask?.result) ? null : JSON.parse(dpTask?.result) as AiAnalyseNewWordsRes;
    console.log('res', res, dpTask?.result);
    return (

        <div className={cn('flex flex-col', className)}>
            {res?.hasNewWord && res?.words?.map((word, i) => (
                <div key={i} className="flex flex-col justify-between px-4 py-2 border-b border-gray-200">
                    <div className="text-lg text-gray-700">{word.word}</div>
                    <div className="text-sm text-gray-500">{word.phonetic}</div>
                    <div className="mt-2 text-sm text-gray-500">{word.meaning}</div>
                </div>
            ))}
            {!res && <div className="text-lg text-gray-700">分析生词中...</div>}
            {res && !res.hasNewWord && <div className="text-lg text-gray-700">没有生词</div>}
        </div>
    )
}

export default ChatLeftWords;
