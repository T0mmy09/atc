import _find from 'lodash/find';
import _forEach from 'lodash/forEach';
import _random from 'lodash/random';
import BaseCollection from '../../base/BaseCollection';
import StandardRouteModel from './StandardRouteModel';

/**
 * Accept `sids` or `stars` data from an airport json file and create a collection of model objects.
 *
 * Provides and interface to reason about a `StandardRoute`, defined as either a SID or STAR.
 * Creates a `StandardRouteModel` for each route defined in the StandardRoute.
 *
 * @class StandardRouteCollection
 */
export default class StandardRouteCollection extends BaseCollection {
    /**
     * @constructor
     * @param standardRouteEnum {object}
     */
    constructor(standardRouteEnum) {
        super(standardRouteEnum);

        if (typeof standardRouteEnum === 'undefined') {
            return;
        }

        return this._init(standardRouteEnum);
    }

    /**
     * Lifecycle method. Should be run only once on instantiation.
     *
     * @for StandardRouteCollection
     * @method _init
     * @param standardRouteEnum {object}
     * @private
     */
    _init(standardRouteEnum) {
        this._addRouteListToCollection(standardRouteEnum);

        return this;
    }

    /**
     * Destroy the current instance
     *
     * @for StandardRouteCollection
     * @method destroy
     */
    destroy() {
        this._items = [];

        return this;
    }

    // TODO: update implementations to accept the FixModel instead of an array
    /**
     * Find a list of fixes for a route, given an `icao`, `exitFixName` and `runwayName` parameter.
     *
     * @for StandardRouteCollection
     * @method getSID
     * @param icao {string}
     * @param exitFixName {string}
     * @param runwayName {string}
     * @return {array}
     */
    findFixesForSidByRunwayAndExit(icao, exitFixName, runwayName) {
        if (!icao) {
            return;
        }

        const sid = this.findRouteByIcao(icao);

        return sid.findFixesAndRestrictionsForRunwayAndExit(runwayName, exitFixName);
    }

    // TODO: update implementations to accept the FixModel instead of an array
    /**
     * Find a list of fixes for a route, given an `icao`, `entryFixName` and `runwayName` parameter.
     *
     * Used to gather all the fixes for a give STAR route.
     *
     * @for StandardRouteCollection
     * @method getSID
     * @param icao {string}
     * @param entryFixName {string}
     * @param runwayName {string} (optional)
     * @return {array}
     */
    findFixesForStarByEntryAndRunway(icao, entryFixName, runwayName) {
        if (!icao) {
            return;
        }

        const star = this.findRouteByIcao(icao);

        return star.findFixesAndRestrictionsForEntryAndRunway(entryFixName, runwayName);
    }

    /**
     * Find a list of `StandardWaypointModel`s for a specific route
     *
     * @for StandardRouteCollection
     * @method findFixModelsForRouteByEntryAndExit
     * @param icao {string}
     * @param entry {string}
     * @param exit {string}
     * @param isPreSpawn {boolean} flag used to determine if distances between waypoints should be calculated
     * @return {StandardRouteModel}
     */
    findFixModelsForRouteByEntryAndExit(icao, entry, exit, isPreSpawn) {
        if (!icao) {
            return;
        }

        const route = this.findRouteByIcao(icao);

        return route.findStandardWaypointModelsForEntryAndExit(entry, exit, isPreSpawn);
    }

    /**
     * Find a random name of an `exitPoint` segment that exists within the collection.
     *
     * @for StandardRouteCollection
     * @method findRandomExitPointForSIDIcao
     * @param icao {string}
     * @return {string}
     */
    findRandomExitPointForSIDIcao(icao) {
        const sid = this.findRouteByIcao(icao);

        // if sid doesnt have any exit points it ends at fix for which the SID is named
        if (!sid.hasExitPoints()) {
            return sid.icao;
        }

        // if has exitPoints, return a randomly selected one from a list of exitFixNames
        const exitPointIcaos = sid.gatherExitPointNames();
        const maxIndex = exitPointIcaos.length - 1;
        const randomIndex = _random(0, maxIndex);

        return exitPointIcaos[randomIndex];
    }

    /**
     * Find a `StandardRouteModel` within the collection given an `icao`
     *
     * @for StandardRouteCollection
     * @method findRouteByIcao
     * @param icao {string}
     * @return {StandardRouteModel|undefined}
     */
    findRouteByIcao(icao) {
        return _find(this._items, { icao: icao });
    }

    /**
     * Add a list of sids to the collection
     *
     * @for StandardRouteCollection
     * @method _addRouteListToCollection
     * @param routeList {object}
     * @private
     */
    _addRouteListToCollection(routeList) {
        _forEach(routeList, (route) => {
            const routeModel = new StandardRouteModel(route);

            this._addSidToCollection(routeModel);
        });

        return this;
    }

    /**
     * Add a `StandardRouteModel` to the collection and update length.
     *
     * @for StandardRouteCollection
     * @method _addSidToCollection
     * @param routeModel {StandardRouteModel}
     * @private
     */
    _addSidToCollection(routeModel) {
        if (!(routeModel instanceof StandardRouteModel)) {
            // eslint-disable-next-line max-len
            throw new TypeError(`Expected routeModel to be an instance of StandardRouteModel, instead received ${routeModel}`);
        }

        this._items.push(routeModel);

        return this;
    }
}
