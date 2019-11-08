import {
    randomInts,
} from '~/utils/random';

export default function pickNotesFromNoteValues({
    noteValues,
    numberOfNotes,
    allowLessNumberOfNotes,
}) {
    let accumCount = 0;
    const weights = Object.keys(noteValues)
        .map((value) => {
            const min = accumCount + 1;
            accumCount += noteValues[value].length;
            return {
                value,
                min,
                max: accumCount,
            };
        });

    if (!accumCount
        || (accumCount < numberOfNotes && !allowLessNumberOfNotes)
    ) {
        return [];
    }

    const noteKeyData = [];
    const targetWeight = randomInts(numberOfNotes, 1, accumCount);
    let idx = 0;
    targetWeight.forEach((weight) => {
        while (weights[idx].max < weight) idx += 1;
        const {
            value,
            min,
        } = weights[idx];
        noteKeyData.push({
            value,
            key: noteValues[value][weight - min],
        });
    });

    return noteKeyData;
}
