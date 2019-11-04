import ConnectionService from '~ui/services/ConnectionService';

export default async function confidentialTransfer({
    assetAddress,
    proof,
    signatures,
}) {
    const proofData = proof.encodeABI(assetAddress);
    const response = await ConnectionService.post({
        action: 'metamask.zkAsset.confidentialTransfer',
        data: {
            proofData,
            assetAddress,
            signatures,
        },
    });

    return response;
}
