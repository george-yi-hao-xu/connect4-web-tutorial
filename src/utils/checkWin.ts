import { GamePlace } from "../types";

export function transpose<T>(matrix: T[][]){
    if (matrix.length === 0 || matrix.some(li => li.length === 0)){
        throw new Error('A matrix cannot be 0 dimensional');
    }
    const eachColLength = matrix.map(li => li.length)
    if(!is_all_list_elements_same(eachColLength)) {
        throw new Error('This matrix is not uni')
    }

    const result: T[][] = []
    const newRowCount = matrix[0].length
    for (let r = 0; r < newRowCount; r++) {
        const newCol = matrix.map(col => col[r])
        result.push(newCol)
    }
    return result;
}

export function get_diagonals<T>(matrix: T[][]){
    const down_right = new Map<number, T[]>() // nw to sw
    const down_left = new Map<number, T[]>() // ne to sw

    function assign_item(groups: Map<number, T[]>, key: number, item:T){
        const diagonal_list = groups.get(key)
        if(diagonal_list){
            diagonal_list.push(item)
        }else{
            groups.set(key, [item])
        }
    }

    // iter all items
    matrix.forEach((col, col_index) => {
        col.forEach((item, row_index) => {
            assign_item(down_right, row_index - col_index, item);
            assign_item(down_left, row_index + col_index, item);
        })
    })

    // flatten
    return [...down_right.values(), ...down_left.values()]
}

export function is_all_list_elements_same(arr: unknown[]) {
  if (arr.length === 0) return false;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] !== arr[0]) return false;
  }
  return true;
}

export function r_check_win_in_a_list(col: GamePlace[], target_place: GamePlace, chain: number){
    if (chain <= 1) throw new Error('Chain must be bigger than 1')
    if (col.length < chain) return false;

    if (col[0] == target_place && is_all_list_elements_same(col.slice(0, chain))){
        return true
    }else {
        return r_check_win_in_a_list(col.slice(1), target_place, chain)
    }
}

export function check_win(matrix: GamePlace[][], target_place: GamePlace, chain: number) {
    // check columns
    if(matrix.some(col => r_check_win_in_a_list(col, target_place, chain))) return true;

    // check rows
    if(transpose(matrix).some(row => r_check_win_in_a_list(row, target_place, chain))) return true;

    // check diagionals
    if(get_diagonals(matrix).some(dia => r_check_win_in_a_list(dia, target_place, chain))) return true;

    return false
}

