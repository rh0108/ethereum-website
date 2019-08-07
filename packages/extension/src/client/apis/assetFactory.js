import Asset from './Asset';

export default async function assetFactory(assetId) {
    const asset = new Asset({
        id: assetId,
    });
    await asset.refresh();

    return asset;
}
